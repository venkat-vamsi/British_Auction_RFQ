package com.rfq.british.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SubmitBidRequest {

    @NotBlank(message = "Carrier name is required")
    private String carrierName;

    @NotNull @DecimalMin(value = "0.0", inclusive = false, message = "Freight charges must be positive")
    private BigDecimal freightCharges;

    @NotNull @DecimalMin(value = "0.0", message = "Origin charges must be zero or positive")
    private BigDecimal originCharges;

    @NotNull @DecimalMin(value = "0.0", message = "Destination charges must be zero or positive")
    private BigDecimal destinationCharges;

    @NotNull @Min(value = 1, message = "Transit time must be at least 1 day")
    private Integer transitTimeDays;

    @NotNull(message = "Quote validity date is required")
    @Future(message = "Quote validity must be a future date")
    private LocalDate quoteValidityDate;
}
