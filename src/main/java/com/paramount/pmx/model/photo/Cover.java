package com.paramount.pmx.model.photo;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "covers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Cover {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(length = 191)
    private String hashkey;

    @Column(name = "original_filename", length = 191)
    private String originalFilename;

    @Column(length = 191)
    private String filename;

    @Column(name = "content_type", length = 191)
    private String contentType;

    @Column(length = 191)
    private String filesize;

    @Column(length = 191)
    private String dimensions;

    @Column(length = 191)
    private String positions;

    @Column(length = 191)
    private String details;

    @Column(columnDefinition = "text")
    private String keywords;

    @Column(columnDefinition = "text")
    private String colors;

    @Column(name = "articles_count")
    private Integer articlesCount;

    @Column(name = "ext_url", length = 191)
    private String extUrl;

    private Integer revision;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    //이미지 url 조합 (가상 field)
    @Transient
    private String coverThumbUrl;

    //이미지 style (가상 field)
    @Transient
    private String style;
    //이미지 style (가상 field)
    @Transient
    private String packStyle;

    //이미지 url 조합 (가상 field) -- 원본크기 이미지
    @Transient
    private String coverOriginalThumbUrl;

    @PostLoad
    public void postLoad() {
        if (this.hashkey != null){


            this.coverThumbUrl = (this.extUrl != null && !this.extUrl.isBlank() && this.extUrl.matches("(?i).*original\\.[a-z0-9]+$"))
                    ? this.extUrl.replaceAll("(?i)original\\.([a-z0-9]+)$", "medium.$1")
                    : this.extUrl;
            this.coverOriginalThumbUrl =  this.extUrl;
            //this.coverThumbUrl = "covers/"+this.hashkey + "/" + ((this.extUrl).split("\\.").length == 1 ? "medium" : "medium."+(this.extUrl).split("\\.")[(this.extUrl).split("\\.").length-1]);
            //this.coverOriginalThumbUrl = "covers/"+this.hashkey + "/" + ((this.extUrl).split("\\.").length == 1 ? "original" : "original."+(this.extUrl).split("\\.")[(this.extUrl).split("\\.").length-1]);
        }

        ObjectMapper mapper = new ObjectMapper();
        try {
            Map<String, String> map = mapper.readValue(this.details, new TypeReference<Map<String, String>>(){});
            this.packStyle = 55 <= Float.parseFloat(map.get("ratio")) && Float.parseFloat(map.get("ratio")) <= 120
                    ? "50% 50% / cover no-repeat transparent;"
                    : "50% 50% / contain no-repeat transparent;";
            this.style = 55 <= Float.parseFloat(map.get("ratio")) && Float.parseFloat(map.get("ratio")) <= 140
                    ? "50% 50% / cover no-repeat transparent;"
                    : 140 < Float.parseFloat(map.get("ratio"))
                    ? "50% 0% / cover no-repeat transparent;"
                    : "50% 50% / contain no-repeat transparent;";
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            this.packStyle = null;
            this.style = null;
        }
    }

}
