package com.rfq.british.dto.request;

import com.rfq.british.enums.ExtensionTrigger;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class CreateRfqRequest {

    @NotBlank(message = "RFQ name is required")
    private String rfqName;

    @NotBlank(message = "Reference ID is required")
    private String referenceId;

    @NotNull(message = "Bid start time is required")
    private LocalDateTime bidStartTime;

    @NotNull(message = "Bid close time is required")
    private LocalDateTime bidCloseTime;

    @NotNull(message = "Forced close time is required")
    private LocalDateTime forcedCloseTime;

    @NotNull(message = "Pickup/service date is required")
    private LocalDate pickupServiceDate;

    @NotNull(message = "Trigger window minutes is required")
    @Min(value = 1, message = "Trigger window must be at least 1 minute")
    private Integer triggerWindowMinutes;

    @NotNull(message = "Extension duration minutes is required")
    @Min(value = 1, message = "Extension duration must be at least 1 minute")
    private Integer extensionDurationMinutes;

    @NotNull(message = "Extension trigger type is required")
    private ExtensionTrigger extensionTrigger;
}
