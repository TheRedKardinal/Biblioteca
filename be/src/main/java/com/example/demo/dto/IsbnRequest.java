package com.example.demo.dto;

import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.util.List;

// ISBN di un blocco del catalogo FE (tutte le edizioni delle opere mostrate).
// Il tetto evita richieste enormi: un blocco da 30 opere ne porta qualche migliaio.
public record IsbnRequest(
        @NotEmpty @Size(max = 10000)
        List<@NotNull @Positive @Digits(integer = 13, fraction = 0) BigDecimal> isbn
) {
}
