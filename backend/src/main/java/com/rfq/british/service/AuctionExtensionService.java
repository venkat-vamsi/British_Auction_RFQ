package com.rfq.british.service;

import com.rfq.british.dto.response.BidResponse;
import com.rfq.british.enums.EventType;
import com.rfq.british.model.AuctionConfig;
import com.rfq.british.model.Bid;
import com.rfq.british.model.Rfq;
import com.rfq.british.repository.RfqRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuctionExtensionService {

    private final RfqRepository rfqRepository;
    private final ActivityLogService activityLogService;

    /**
     * Called after a bid is submitted. Evaluates whether the auction should
     * be extended based on the configured trigger and current time.
     *
     * @param rfq         the RFQ (will be mutated and saved if extended)
     * @param newBid      the bid just submitted
     * @param ranksBefore ranked bids BEFORE this new bid
     * @param ranksAfter  ranked bids AFTER this new bid
     * @return true if the auction was extended
     */
    public boolean checkAndExtend(Rfq rfq, Bid newBid,
                                   List<BidResponse> ranksBefore,
                                   List<BidResponse> ranksAfter) {
        AuctionConfig config = rfq.getAuctionConfig();
        if (config == null) return false;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime closeTime = rfq.getBidCloseTime();
        LocalDateTime windowStart = closeTime.minusMinutes(config.getTriggerWindowMinutes());

        // Only check when current time falls within the trigger window
        if (now.isBefore(windowStart)) {
            return false;
        }

        boolean shouldExtend = switch (config.getExtensionTrigger()) {
            case BID_RECEIVED -> true;
            case ANY_RANK_CHANGE -> hasAnyRankChange(ranksBefore, ranksAfter);
            case L1_RANK_CHANGE -> hasL1Changed(ranksBefore, ranksAfter);
        };

        if (!shouldExtend) return false;

        LocalDateTime newCloseTime = closeTime.plusMinutes(config.getExtensionDurationMinutes());
        LocalDateTime cap = rfq.getForcedCloseTime();

        if (newCloseTime.isAfter(cap)) {
            newCloseTime = cap;
        }

        if (!newCloseTime.isAfter(closeTime)) {
            log.info("RFQ {}: already at forced close ceiling, no extension applied", rfq.getId());
            return false;
        }

        LocalDateTime oldCloseTime = rfq.getBidCloseTime();
        rfq.setBidCloseTime(newCloseTime);
        rfqRepository.save(rfq);

        String reason = config.getExtensionTrigger().getDescription();
        String description = String.format(
                "Auction extended by %d min. Trigger: %s. %s → %s",
                config.getExtensionDurationMinutes(), reason, oldCloseTime, newCloseTime
        );
        activityLogService.log(rfq, EventType.TIME_EXTENDED, description, oldCloseTime, newCloseTime, newBid);
        log.info("RFQ {}: extended from {} to {}", rfq.getId(), oldCloseTime, newCloseTime);
        return true;
    }

    private boolean hasAnyRankChange(List<BidResponse> before, List<BidResponse> after) {
        if (before.size() != after.size()) return true;
        for (int i = 0; i < before.size(); i++) {
            if (!Objects.equals(before.get(i).getSupplierId(), after.get(i).getSupplierId())) {
                return true;
            }
        }
        return false;
    }

    private boolean hasL1Changed(List<BidResponse> before, List<BidResponse> after) {
        Long l1Before = before.isEmpty() ? null : before.get(0).getSupplierId();
        Long l1After = after.isEmpty() ? null : after.get(0).getSupplierId();
        return !Objects.equals(l1Before, l1After);
    }
}
