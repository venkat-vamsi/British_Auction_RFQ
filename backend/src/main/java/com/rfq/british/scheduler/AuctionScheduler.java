package com.rfq.british.scheduler;

import com.rfq.british.dto.response.AuctionUpdateMessage;
import com.rfq.british.enums.AuctionStatus;
import com.rfq.british.enums.EventType;
import com.rfq.british.model.Rfq;
import com.rfq.british.repository.RfqRepository;
import com.rfq.british.service.ActivityLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final RfqRepository rfqRepository;
    private final ActivityLogService activityLogService;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedDelayString = "${auction.scheduler.interval-ms}")
    @Transactional
    public void processAuctions() {
        LocalDateTime now = LocalDateTime.now();

        forceCloseExpiredAuctions(now);
        closeExpiredAuctions(now);
        activatePendingAuctions(now);
    }

    private void forceCloseExpiredAuctions(LocalDateTime now) {
        List<Rfq> toForceClose = rfqRepository
                .findByStatusAndForcedCloseTimeBefore(AuctionStatus.ACTIVE, now);

        for (Rfq rfq : toForceClose) {
            rfq.setStatus(AuctionStatus.FORCE_CLOSED);
            rfqRepository.save(rfq);
            activityLogService.log(rfq, EventType.AUCTION_FORCE_CLOSED,
                    "Auction force closed at " + now);
            broadcast(rfq, AuctionStatus.FORCE_CLOSED, "Auction has been force closed");
            log.info("RFQ {} force-closed", rfq.getId());
        }
    }

    private void closeExpiredAuctions(LocalDateTime now) {
        List<Rfq> toClose = rfqRepository
                .findByStatusAndBidCloseTimeBefore(AuctionStatus.ACTIVE, now);

        for (Rfq rfq : toClose) {
            // Skip if forced close time also passed (handled above)
            if (rfq.getForcedCloseTime().isBefore(now) || rfq.getForcedCloseTime().isEqual(now)) {
                continue;
            }
            rfq.setStatus(AuctionStatus.CLOSED);
            rfqRepository.save(rfq);
            activityLogService.log(rfq, EventType.AUCTION_CLOSED,
                    "Auction closed normally at " + now);
            broadcast(rfq, AuctionStatus.CLOSED, "Auction has closed");
            log.info("RFQ {} closed normally", rfq.getId());
        }
    }

    private void activatePendingAuctions(LocalDateTime now) {
        List<Rfq> toActivate = rfqRepository.findDueToActivate(AuctionStatus.DRAFT, now);
        for (Rfq rfq : toActivate) {
            rfq.setStatus(AuctionStatus.ACTIVE);
            rfqRepository.save(rfq);
            activityLogService.log(rfq, EventType.AUCTION_STARTED,
                    "Auction started at " + now);
            broadcast(rfq, AuctionStatus.ACTIVE, "Auction is now open for bidding");
            log.info("RFQ {} activated", rfq.getId());
        }
    }

    private void broadcast(Rfq rfq, AuctionStatus newStatus, String message) {
        AuctionUpdateMessage update = AuctionUpdateMessage.builder()
                .type(AuctionUpdateMessage.UpdateType.STATUS_CHANGED)
                .rfqId(rfq.getId())
                .newStatus(newStatus)
                .newCloseTime(rfq.getBidCloseTime())
                .message(message)
                .build();
        messagingTemplate.convertAndSend("/topic/auction/" + rfq.getId(), update);
    }
}
