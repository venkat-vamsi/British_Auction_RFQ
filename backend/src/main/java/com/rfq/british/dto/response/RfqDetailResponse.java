package com.rfq.british.dto.response;

import com.rfq.british.enums.AuctionStatus;
import com.rfq.british.enums.ExtensionTrigger;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RfqDetailResponse {
    private Long id;
    private String rfqName;
    private String referenceId;
    private String createdByName;
    private String createdByCompany;
    private LocalDateTime bidStartTime;
    private LocalDateTime bidCloseTime;
    private LocalDateTime forcedCloseTime;
    private LocalDate pickupServiceDate;
    private AuctionStatus status;
    private LocalDateTime createdAt;

    // Auction config
    private Integer triggerWindowMinutes;
    private Integer extensionDurationMinutes;
    private ExtensionTrigger extensionTrigger;

    // Ranked bids (best bid per supplier, sorted by total ASC)
    private List<BidResponse> rankedBids;

    // Activity log
    private List<ActivityLogResponse> activityLog;
}
