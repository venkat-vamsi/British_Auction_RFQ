package com.rfq.british.dto.response;

import com.rfq.british.enums.AuctionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RfqSummaryResponse {
    private Long id;
    private String rfqName;
    private String referenceId;
    private BigDecimal currentLowestBid;
    private String currentLowestBidSupplier;
    private LocalDateTime bidCloseTime;
    private LocalDateTime forcedCloseTime;
    private AuctionStatus status;
    private LocalDateTime createdAt;
}
