package com.rfq.british.dto.response;

import com.rfq.british.enums.AuctionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AuctionUpdateMessage {

    public enum UpdateType {
        BID_SUBMITTED, TIME_EXTENDED, STATUS_CHANGED
    }

    private UpdateType type;
    private Long rfqId;
    private AuctionStatus newStatus;
    private LocalDateTime newCloseTime;
    private BidResponse latestBid;
    private String message;
}
