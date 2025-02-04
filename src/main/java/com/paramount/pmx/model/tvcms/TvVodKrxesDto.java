package com.paramount.pmx.model.tvcms;


import com.paramount.pmx.model.setting.Krxes;
import lombok.*;
import lombok.experimental.Accessors;
import org.springframework.stereotype.Component;
import java.io.Serializable;


@Component
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@ToString
@Accessors(chain = true)
public class TvVodKrxesDto implements Serializable {

    private Long id;
    private Long vodId;
    private Long krxeId;
    private Krxes krxes;
    private TvVods tvVods;
    private Long createdBy;
    private Long updatedBy;
    private String createdAt;
    private String updatedAt;

}
