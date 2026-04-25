package com.rfq.british.service;

import com.rfq.british.dto.request.CreateRfqRequest;
import com.rfq.british.dto.response.*;
import com.rfq.british.enums.AuctionStatus;
import com.rfq.british.model.*;
import com.rfq.british.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class RfqService {

    private final RfqRepository rfqRepository;
    private final AuctionConfigRepository auctionConfigRepository;
    private final UserRepository userRepository;
    private final BidRepository bidRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public RfqDetailResponse createRfq(CreateRfqRequest request, Long buyerId) {
        validateRfqTimes(request);

        if (rfqRepository.existsByReferenceId(request.getReferenceId())) {
            throw new IllegalArgumentException("Reference ID already exists: " + request.getReferenceId());
        }

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        LocalDateTime now = LocalDateTime.now();
        AuctionStatus initialStatus = request.getBidStartTime().isAfter(now)
                ? AuctionStatus.DRAFT
                : AuctionStatus.ACTIVE;

        Rfq rfq = Rfq.builder()
                .rfqName(request.getRfqName())
                .referenceId(request.getReferenceId())
                .createdBy(buyer)
                .bidStartTime(request.getBidStartTime())
                .bidCloseTime(request.getBidCloseTime())
                .forcedCloseTime(request.getForcedCloseTime())
                .pickupServiceDate(request.getPickupServiceDate())
                .status(initialStatus)
                .build();
        rfq = rfqRepository.save(rfq);

        AuctionConfig config = AuctionConfig.builder()
                .rfq(rfq)
                .triggerWindowMinutes(request.getTriggerWindowMinutes())
                .extensionDurationMinutes(request.getExtensionDurationMinutes())
                .extensionTrigger(request.getExtensionTrigger())
                .build();
        auctionConfigRepository.save(config);
        rfq.setAuctionConfig(config);

        return buildDetailResponse(rfq);
    }

    @Transactional(readOnly = true)
    public List<RfqSummaryResponse> listRfqs() {
        return rfqRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::buildSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public RfqDetailResponse getRfqDetail(Long rfqId) {
        Rfq rfq = rfqRepository.findById(rfqId)
                .orElseThrow(() -> new IllegalArgumentException("RFQ not found: " + rfqId));
        return buildDetailResponse(rfq);
    }

    // ── Mappers ─────────────────────────────────────────────────────────────

    public RfqSummaryResponse buildSummaryResponse(Rfq rfq) {
        List<Bid> bestBids = bidRepository.findBestBidPerSupplier(rfq.getId());
        String lowestSupplier = null;
        if (!bestBids.isEmpty()) {
            lowestSupplier = bestBids.get(0).getSupplier().getCompanyName();
        }
        return RfqSummaryResponse.builder()
                .id(rfq.getId())
                .rfqName(rfq.getRfqName())
                .referenceId(rfq.getReferenceId())
                .currentLowestBid(bestBids.isEmpty() ? null : bestBids.get(0).getTotalCharges())
                .currentLowestBidSupplier(lowestSupplier)
                .bidCloseTime(rfq.getBidCloseTime())
                .forcedCloseTime(rfq.getForcedCloseTime())
                .status(rfq.getStatus())
                .createdAt(rfq.getCreatedAt())
                .build();
    }

    public RfqDetailResponse buildDetailResponse(Rfq rfq) {
        AuctionConfig config = rfq.getAuctionConfig();
        if (config == null) {
            config = auctionConfigRepository.findByRfqId(rfq.getId()).orElse(null);
        }

        List<BidResponse> rankedBids = computeRankedBids(rfq.getId());

        List<ActivityLogResponse> logs = activityLogRepository
                .findByRfqIdOrderByCreatedAtAsc(rfq.getId())
                .stream()
                .map(this::mapLog)
                .toList();

        return RfqDetailResponse.builder()
                .id(rfq.getId())
                .rfqName(rfq.getRfqName())
                .referenceId(rfq.getReferenceId())
                .createdByName(rfq.getCreatedBy().getName())
                .createdByCompany(rfq.getCreatedBy().getCompanyName())
                .bidStartTime(rfq.getBidStartTime())
                .bidCloseTime(rfq.getBidCloseTime())
                .forcedCloseTime(rfq.getForcedCloseTime())
                .pickupServiceDate(rfq.getPickupServiceDate())
                .status(rfq.getStatus())
                .createdAt(rfq.getCreatedAt())
                .triggerWindowMinutes(config != null ? config.getTriggerWindowMinutes() : null)
                .extensionDurationMinutes(config != null ? config.getExtensionDurationMinutes() : null)
                .extensionTrigger(config != null ? config.getExtensionTrigger() : null)
                .rankedBids(rankedBids)
                .activityLog(logs)
                .build();
    }

    public List<BidResponse> computeRankedBids(Long rfqId) {
        List<Bid> bestBids = bidRepository.findBestBidPerSupplier(rfqId);
        return IntStream.range(0, bestBids.size())
                .mapToObj(i -> mapBidWithRank(bestBids.get(i), "L" + (i + 1)))
                .toList();
    }

    public BidResponse mapBidWithRank(Bid bid, String rank) {
        return BidResponse.builder()
                .id(bid.getId())
                .rfqId(bid.getRfq().getId())
                .supplierId(bid.getSupplier().getId())
                .supplierCompany(bid.getSupplier().getCompanyName())
                .carrierName(bid.getCarrierName())
                .freightCharges(bid.getFreightCharges())
                .originCharges(bid.getOriginCharges())
                .destinationCharges(bid.getDestinationCharges())
                .totalCharges(bid.getTotalCharges())
                .transitTimeDays(bid.getTransitTimeDays())
                .quoteValidityDate(bid.getQuoteValidityDate())
                .submittedAt(bid.getSubmittedAt())
                .rank(rank)
                .build();
    }

    private ActivityLogResponse mapLog(com.rfq.british.model.ActivityLog log) {
        return ActivityLogResponse.builder()
                .id(log.getId())
                .eventType(log.getEventType())
                .description(log.getDescription())
                .oldCloseTime(log.getOldCloseTime())
                .newCloseTime(log.getNewCloseTime())
                .bidId(log.getBid() != null ? log.getBid().getId() : null)
                .createdAt(log.getCreatedAt())
                .build();
    }

    private void validateRfqTimes(CreateRfqRequest req) {
        if (!req.getForcedCloseTime().isAfter(req.getBidCloseTime())) {
            throw new IllegalArgumentException("Forced close time must be after bid close time");
        }
        if (!req.getBidCloseTime().isAfter(req.getBidStartTime())) {
            throw new IllegalArgumentException("Bid close time must be after bid start time");
        }
    }
}
