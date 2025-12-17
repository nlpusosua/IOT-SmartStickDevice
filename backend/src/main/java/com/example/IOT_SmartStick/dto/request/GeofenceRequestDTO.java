package com.example.IOT_SmartStick.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GeofenceRequestDTO {

    @NotBlank(message = "Tên vùng an toàn không được để trống")
    private String name;

    @NotNull(message = "Vĩ độ tâm không được để trống")
    @DecimalMin(value = "-90.0", message = "Vĩ độ phải >= -90")
    @DecimalMax(value = "90.0", message = "Vĩ độ phải <= 90")
    private BigDecimal centerLatitude;

    @NotNull(message = "Kinh độ tâm không được để trống")
    @DecimalMin(value = "-180.0", message = "Kinh độ phải >= -180")
    @DecimalMax(value = "180.0", message = "Kinh độ phải <= 180")
    private BigDecimal centerLongitude;

    @NotNull(message = "Bán kính không được để trống")
    @Min(value = 50, message = "Bán kính tối thiểu 50m")
    @Max(value = 5000, message = "Bán kính tối đa 5000m")
    private Integer radiusMeters;

    private Boolean active = true;
}