package com.rfq.british.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BidResponse {
    private Long id;
    private Long rfqId;
    private Long supplierId;
    private String supplierCompany;
    private String carrierName;
    private BigDecimal freightCharges;
    private BigDecimal originCharges;
    private BigDecimal destinationCharges;
    private BigDecimal totalCharges;
    private Integer transitTimeDays;
    private LocalDate quoteValidityDate;
    private LocalDateTime submittedAt;
    private String rank;
}
