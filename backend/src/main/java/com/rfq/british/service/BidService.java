package com.rfq.british.service;

import com.rfq.british.dto.request.SubmitBidRequest;
import com.rfq.british.dto.response.AuctionUpdateMessage;
import com.rfq.british.dto.response.BidResponse;
import com.rfq.british.enums.AuctionStatus;
import com.rfq.british.enums.EventType;
import com.rfq.british.model.Bid;
import com.rfq.british.model.Rfq;
import com.rfq.british.model.User;
import com.rfq.british.repository.BidRepository;
import com.rfq.british.repository.RfqRepository;
import com.rfq.british.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BidService {

    private final BidRepository bidRepository;
    private final RfqRepository rfqRepository;
    private final UserRepository userRepository;
    private final AuctionExtensionService extensionService;
    private final ActivityLogService activityLogService;
    private final RfqService rfqService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public BidResponse submitBid(Long rfqId, SubmitBidRequest request, Long supplierId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + rfqId));

        validateBiddingOpen(rfq);

        User supplier = userRepository.findById(supplierId)
                .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));

        BigDecimal newTotal = request.getFreightCharges()
                .add(request.getOriginCharges())
                .add(request.getDestinationCharges());

        validateBidIsLower(rfqId, supplierId, newTotal);

        // Capture rankings BEFORE this bid (for extension logic)
        List<BidResponse> ranksBefore = rfqService.computeRankedBids(rfqId);

        Bid bid = Bid.builder()
                .rfq(rfq)
                .supplier(supplier)
                .carrierName(request.getCarrierName())
                .freightCharges(request.getFreightCharges())
                .originCharges(request.getOriginCharges())
                .destinationCharges(request.getDestinationCharges())
                .totalCharges(newTotal)
                .transitTimeDays(request.getTransitTimeDays())
                .quoteValidityDate(request.getQuoteValidityDate())
                .build();
        bid = bidRepository.save(bid);

        String logDesc = String.format("Bid submitted by %s — Total: %.2f",
                supplier.getCompanyName(), newTotal);
        activityLogService.log(rfq, EventType.BID_SUBMITTED, logDesc, bid);

        // Capture rankings AFTER this bid
        List<BidResponse> ranksAfter = rfqService.computeRankedBids(rfqId);

        // Check and potentially extend the auction
        boolean extended = extensionService.checkAndExtend(rfq, bid, ranksBefore, ranksAfter);

        // Find the rank of this supplier in the updated ranking
        String rank = ranksAfter.stream()
                .filter(r -> r.getSupplierId().equals(supplierId))
                .map(BidResponse::getRank)
                .findFirst()
                .orElse("–");

        BidResponse bidResponse = rfqService.mapBidWithRank(bid, rank);

        // Broadcast update to all subscribers
        AuctionUpdateMessage update = AuctionUpdateMessage.builder()
                .type(extended
                        ? AuctionUpdateMessage.UpdateType.TIME_EXTENDED
                        : AuctionUpdateMessage.UpdateType.BID_SUBMITTED)
                .rfqId(rfqId)
                .newStatus(rfq.getStatus())
                .newCloseTime(rfq.getBidCloseTime())
                .latestBid(bidResponse)
                .message(extended
                        ? "Auction extended to " + rfq.getBidCloseTime()
                        : "New bid received from " + supplier.getCompanyName())
                .build();

        messagingTemplate.convertAndSend("/topic/auction/" + rfqId, update);
        log.info("Bid submitted for RFQ {} by supplier {}, rank={}", rfqId, supplierId, rank);

        return bidResponse;
    }

    @Transactional(readOnly = true)
    public List<BidResponse> getBidsForRfq(Long rfqId) {
        if (!rfqRepository.existsById(rfqId)) {
            throw new IllegalArgumentException("RFQ not found: " + rfqId);
        }
        return rfqService.computeRankedBids(rfqId);
    }

    private void validateBiddingOpen(Rfq rfq) {
        if (rfq.getStatus() != AuctionStatus.ACTIVE) {
            throw new IllegalStateException("Auction is not active. Status: " + rfq.getStatus());
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(rfq.getBidStartTime())) {
            throw new IllegalStateException("Auction has not started yet");
        }
        if (now.isAfter(rfq.getBidCloseTime())) {
            throw new IllegalStateException("Auction has already closed");
        }
    }

    private void validateBidIsLower(Long rfqId, Long supplierId, BigDecimal newTotal) {
        Optional<Bid> currentBest = bidRepository
                .findTopByRfqIdAndSupplierIdOrderByTotalChargesAsc(rfqId, supplierId);
        if (currentBest.isPresent() && newTotal.compareTo(currentBest.get().getTotalCharges()) >= 0) {
            throw new IllegalArgumentException(
                    String.format("New bid total (%.2f) must be lower than your current best bid (%.2f)",
                            newTotal, currentBest.get().getTotalCharges()));
        }
    }
}
