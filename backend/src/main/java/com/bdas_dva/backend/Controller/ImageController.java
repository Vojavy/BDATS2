package com.bdas_dva.backend.Controller;

import com.bdas_dva.backend.Service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/images")
@CrossOrigin(origins = "http://localhost:3000")
public class ImageController {

    @Autowired
    private ImageService imageService;

    /**
     * Получение всех изображений (только метаданные)
     */
    @GetMapping()
    public ResponseEntity<?> getAllImages() {
        try {
            List<Map<String, Object>> images = imageService.getAllImages();
            if (images.isEmpty()) {
                return ResponseEntity.status(404).body("Изображения не найдены.");
            }
            return ResponseEntity.ok(images);
        } catch (Exception e) {
            // Логируем ошибки
            System.err.println("Ошибка в контроллере: " + e.getMessage());
            return ResponseEntity.status(500).body("Ошибка сервера при получении изображений.");
        }
    }


    /**
     * Получение метаданных изображения по ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getImageById(@PathVariable("id") Long id) {
        try {
            Map<String, Object> image = imageService.getImageById(id);
            return ResponseEntity.ok(image);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Фильтрация изображений по продукту или формату
     */
    @GetMapping("/filter")
    public ResponseEntity<List<Map<String, Object>>> getImagesByFilters(
            @RequestParam(value = "productId", required = false) Long productId,
            @RequestParam(value = "formatId", required = false) Integer formatId
    ) {
        List<Map<String, Object>> images = imageService.getImagesByFilters(productId, formatId);
        return ResponseEntity.ok(images);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> createImage(
            @RequestParam("obrazek") MultipartFile file,
            @RequestParam("nazev") String nazev,
            @RequestParam("format_id_formatu") Integer formatId,
            @RequestParam("produkt_id_produktu") Long productId
    ) {
        try {
            System.out.println("Обработчик вызван с параметрами:");
            System.out.println("Файл: " + (file != null ? file.getOriginalFilename() : "null"));
            System.out.println("Название: " + nazev);
            System.out.println("Формат: " + formatId);
            System.out.println("Продукт: " + productId);

            byte[] obrazek = file.getBytes();
            imageService.createImage(obrazek, nazev, formatId, productId);
            return ResponseEntity.ok("Изображение успешно создано.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при создании изображения: " + e.getMessage());
        }
    }

    /**
     * Обновление изображения
     */
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateImage(
            @PathVariable Long id,
            @RequestParam(value = "obrazek", required = false) MultipartFile file,
            @RequestParam("nazev") String nazev,
            @RequestParam("format_id_formatu") Integer formatId,
            @RequestParam(value = "produkt_id_produktu", required = false) Long productId
    ) {
        try {
            System.out.println("Обработчик вызван с параметрами:");
            System.out.println("Файл: " + (file != null ? file.getOriginalFilename() : "null"));
            System.out.println("Название: " + nazev);
            System.out.println("Формат: " + formatId);
            System.out.println("Продукт: " + productId);
            byte[] obrazek = file != null ? file.getBytes() : null;
            imageService.updateImage(id, obrazek, nazev, formatId, productId);
            return ResponseEntity.ok("Изображение успешно обновлено.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при обновлении изображения: " + e.getMessage());
        }
    }

    /**
     * Удаление изображения
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> deleteImage(@PathVariable Long id) {
        try {
            imageService.deleteImage(id);
            return ResponseEntity.ok("Изображение успешно удалено.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Ошибка при удалении изображения: " + e.getMessage());
        }
    }
}
