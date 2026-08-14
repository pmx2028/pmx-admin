package com.paramount.pmx.utils;

import java.util.*;
import java.util.function.BiConsumer;
import java.util.function.Function;

/**
 * Generic utility to diff two lists (DTO list vs entity list) and categorize
 * items into insert, update, delete operations.
 */
public class EntitySyncUtil {

    public static class SyncResult<E> {
        private final List<E> toInsert;
        private final List<E> toUpdate;
        private final List<E> toDelete;

        public SyncResult(List<E> toInsert, List<E> toUpdate, List<E> toDelete) {
            this.toInsert = toInsert;
            this.toUpdate = toUpdate;
            this.toDelete = toDelete;
        }

        public List<E> getToInsert() {
            return toInsert;
        }

        public List<E> getToUpdate() {
            return toUpdate;
        }

        public List<E> getToDelete() {
            return toDelete;
        }
    }

    /**
     * Compares incoming DTO list and existing entity list to produce insert/update/delete lists.
     *
     * @param dtos               List of incoming DTOs
     * @param entities           List of existing entities
     * @param dtoKeyExtractor    Function to extract key (e.g., ID) from DTO
     * @param entityKeyExtractor Function to extract key from entity
     * @param updater            BiConsumer to apply DTO -> existing entity copy (update)
     * @param creator            Function to create a new entity from DTO (insert)
     * @param <D>                DTO type
     * @param <E>                Entity type
     * @param <K>                Key type for matching
     * @return SyncResult containing lists of entities to insert, update, delete
     */
    public static <D, E, K> SyncResult<E> diff(
            List<D> dtos,
            List<E> entities,
            Function<D, K> dtoKeyExtractor,
            Function<E, K> entityKeyExtractor,
            BiConsumer<D, E> updater,
            Function<D, E> creator
    ) {
        Map<K, E> entityMap = new HashMap<>();
        for (E e : entities) {
            entityMap.put(entityKeyExtractor.apply(e), e);
        }

        List<E> toInsert = new ArrayList<>();
        List<E> toUpdate = new ArrayList<>();
        Set<K> processedKeys = new HashSet<>();

        for (D dto : dtos) {
            K key = dtoKeyExtractor.apply(dto);
            if (key == null || !entityMap.containsKey(key)) {
                // New entity
                E newEntity = creator.apply(dto);
                toInsert.add(newEntity);
            } else {
                // Existing entity => update
                E existing = entityMap.get(key);
                updater.accept(dto, existing);
                toUpdate.add(existing);
                processedKeys.add(key);
            }
        }

        List<E> toDelete = new ArrayList<>();
        // Entities not processed should be deleted
        for (E e : entities) {
            K key = entityKeyExtractor.apply(e);
            if (!processedKeys.contains(key)) {
                toDelete.add(e);
            }
        }

        return new SyncResult<>(toInsert, toUpdate, toDelete);
    }
}