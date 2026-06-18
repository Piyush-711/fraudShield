package com.fraudshield.controller;

import com.fraudshield.dto.Dtos.*;
import com.fraudshield.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "Transaction management and review")
public class TransactionController {

    private final TransactionService transactionService;

    /**
     * PRD Story 1.1 – Real-time transaction evaluation
     * POST /api/v1/transactions/evaluate
     */
    @PostMapping("/evaluate")
    @Operation(summary = "Submit a transaction for real-time fraud evaluation and get approve/reject decision")
    public ResponseEntity<ApiResponse<TransactionDto>> evaluate(@Valid @RequestBody EvaluateTransactionReq req) {
        ApiResponse<TransactionDto> result = transactionService.evaluateTransaction(req);
        return result.isSuccess()
            ? ResponseEntity.ok(result)
            : ResponseEntity.badRequest().body(result);
    }

    @GetMapping
    @Operation(summary = "List all transactions with filters and pagination")
    public ResponseEntity<PagedResponse<TransactionDto>> getTransactions(
        @RequestParam(defaultValue = "ALL")  String status,
        @RequestParam(required = false)      String search,
        @RequestParam(defaultValue = "0")    int page,
        @RequestParam(defaultValue = "10")   int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(transactionService.getTransactions(status, search, page, size, sortBy, sortDir));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get transaction detail with audit history")
    public ResponseEntity<TransactionDto> getById(@PathVariable String id) {
        return transactionService.getById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/review")
    @Operation(summary = "Submit manual review decision for a transaction")
    public ResponseEntity<ApiResponse<TransactionDto>> review(
        @PathVariable String id,
        @RequestBody ManualReviewReq req
    ) {
        ApiResponse<TransactionDto> result = transactionService.submitReview(id, req);
        return result.isSuccess()
            ? ResponseEntity.ok(result)
            : ResponseEntity.badRequest().body(result);
    }
}
