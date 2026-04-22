library(tidyverse)

ids <- read.csv("IDs.csv")[[1]] |>
  str_subset("PA9|PB9|SA9|SB9|PA10|PB10|PC10|SA10|SB10", negate = TRUE)
ids <- c(
  ids,
  "rm00",
  "rm01",
  "rm02",
  "rm03",
  "rm04",
  "ra01",
  "ra02",
  "ra03",
  "ra04",
  "ra05",
  "ra06",
  "ra07",
  "ra08",
  "ra09"
)

trial_dict <- read.csv("trials.csv", colClasses = "character") |>
  rownames_to_column(var = "Trial_id") %>%
    mutate(Replaced = rep(FALSE, nrow(.)))

out_df <- data.frame(
  id=character(),
  trial=integer(),
  type=integer(),
  explain=integer(),
  card1=character(),
  card2=character(),
  card3=character(),
  trialid=integer(),
  memory=integer()
)

block_mask_replace_paired <- function(df1, df2, block_size = 5) {
  # Validation
  if (nrow(df1) != nrow(df2)) stop("Dataframes must have the same number of rows.")
  if (nrow(df1) %% (block_size * 2) != 0) {
    stop("Total rows must be divisible by (block_size * 2) for counterbalancing.")
  }
  
  n_rows <- nrow(df1)
  n_blocks <- n_rows / block_size
  
  # Initialize markers
  df1$Replaced <- FALSE
  df2$Replaced <- FALSE
  
  # Define the two possible sizes for an odd block
  low_n <- floor(block_size / 2)  # e.g., 2
  high_n <- ceiling(block_size / 2) # e.g., 3
  
  # 1. Create counterbalanced sample sizes
  # We iterate by 2 blocks at a time
  sample_sizes <- numeric(n_blocks)
  for (i in seq(1, n_blocks, by = 2)) {
    # Randomly assign which block in the pair gets the 'high_n'
    pair_sizes <- sample(c(low_n, high_n))
    sample_sizes[i] <- pair_sizes[1]
    sample_sizes[i + 1] <- pair_sizes[2]
  }
  
  # 2. Generate mask indices
  mask_indices <- unlist(lapply(1:n_blocks, function(i) {
    block_start <- ((i - 1) * block_size) + 1
    block_end <- i * block_size
    sample(block_start:block_end, sample_sizes[i])
  }))
  
  # 3. Apply replacement logic
  cols_to_copy <- setdiff(names(df1), "Replaced")
  
  df2[mask_indices, "Replaced"] <- TRUE
  df1[mask_indices, "Replaced"] <- TRUE
  df2[mask_indices, cols_to_copy] <- df1[mask_indices, cols_to_copy]
  
  return(list(df1 = df1, df2 = df2))
}

for (id in ids) {
  ID <- c(
    rep(paste0(id, ".a"), 24),
    rep(paste0(id, ".b"), 24),
    rep(paste0(id, ".c"), 24)
  )
  TRIAL <- rep(1:24, 3)
  EXPLAIN <-  rep(c(rep(1, 4), c(rep(0, 20))), 3)
  # numero - forma - textura - color
  # 50% idéntico por bloque o totalmente al azar? solo cartas o cartas+orden?
  # Bloque de práctica Set 0-diferente, NoSet 1-roto color, Set 1-diferente color y NoSet 3-roto forma (orden fijo)
  # 15; -1; 14; -11
  p1 <- slice_sample(
    filter(trial_dict, Type == 15),
    n = 3
  )
  
  p2 <- slice_sample(
    filter(trial_dict, Type == -1),
    n = 3
  )

  p3 <- slice_sample(
    filter(trial_dict, Type == 14),
    n = 3
  )

  p4 <- slice_sample(
    filter(trial_dict, Type == -11),
    n = 3
  )

  d4 <- slice_sample(
    filter(trial_dict, Type == 0),
    n = 12
  )
  # Bloque de evaluación 1 -> Set 1-diferente número, Set 3-diferente textura, Set 4-diferente tipo único, NoSet 3-roto textura y NoSet 1-roto número (orden aleatorio)
  # 7; 2; 0; -13; -8
  b11 <- slice_sample(
    filter(trial_dict, Type == 7),
    n = 3
  )
  b12 <- slice_sample(
    filter(trial_dict, Type == 2),
    n = 3
  )
  b13 <- slice_sample(
    filter(trial_dict, Type == -13),
    n = 3
  )
  b14 <- slice_sample(
    filter(trial_dict, Type == -8),
    n = 3
  )
  
  # Bloque de evaluación 2 -> Set 1-diferente color, Set 3-diferente forma, Set 4-diferente tipo único, NoSet 3-roto forma y NoSet 1-roto color (orden aleatorio)
  # 14; 4; 0; -11; -1
  b21 <- slice_sample(
    filter(trial_dict, Type == 14),
    n = 3
  )
  b22 <- slice_sample(
    filter(trial_dict, Type == 4),
    n = 3
  )
  b23 <- slice_sample(
    filter(trial_dict, Type == -11),
    n = 3
  )
  b24 <- slice_sample(
    filter(trial_dict, Type == -1),
    n = 3
  )
  # Bloque de evaluación 3 -> Set 1-diferente forma, Set 3-diferente color, Set 4-diferente tipo único, NoSet 3-roto color y NoSet 1-roto forma (orden aleatorio)
  # 11; 1; 0; -14; -4
  b31 <- slice_sample(
    filter(trial_dict, Type == 11),
    n = 3
  )
  b32 <- slice_sample(
    filter(trial_dict, Type == 1),
    n = 3
  )
  b33 <- slice_sample(
    filter(trial_dict, Type == -14),
    n = 3
  )
  b34 <- slice_sample(
    filter(trial_dict, Type == -4),
    n = 3
  )
  # Bloque de evaluación 4 -> Set 1-diferente textura, Set 3-diferente número, Set 4-diferente tipo único, NoSet 3-roto número y NoSet 1-roto textura (orden aleatorio)
  # 13; 8; 0; -7; -2
  b41 <- slice_sample(
    filter(trial_dict, Type == 13),
    n = 3
  )
  b42 <- slice_sample(
    filter(trial_dict, Type == 8),
    n = 3
  )
  b43 <- slice_sample(
    filter(trial_dict, Type == -7),
    n = 3
  )
  b44 <- slice_sample(
    filter(trial_dict, Type == -2),
    n = 3
  )

  pre <- bind_rows(
    slice(p1, 1),
    slice(p2, 1),
    slice(p3, 1),
    slice(p4, 1),
    slice_sample(
      bind_rows(
        slice(b11, 1),
        slice(b12, 1),
        slice(d4, 1),
        slice(b13, 1),
        slice(b14, 1),
      ),
      prop = 1
    ),
    slice_sample(
      bind_rows(
        slice(b21, 1),
        slice(b22, 1),
        slice(d4, 2),
        slice(b23, 1),
        slice(b24, 1),
      ),
      prop = 1
    ),
    slice_sample(
      bind_rows(
        slice(b31, 1),
        slice(b32, 1),
        slice(d4, 3),
        slice(b33, 1),
        slice(b34, 1),
      ),
      prop = 1
    ),
    slice_sample(
      bind_rows(
        slice(b41, 1),
        slice(b42, 1),
        slice(d4, 4),
        slice(b43, 1),
        slice(b44, 1),
      ),
      prop = 1
    )
  )

  post_pool <- bind_rows(
    slice(b11, 2),
    slice(b12, 2),
    slice(d4, 5),
    slice(b13, 2),
    slice(b14, 2),
    slice(b21, 2),
    slice(b22, 2),
    slice(d4, 6),
    slice(b23, 2),
    slice(b24, 2),
    slice(b31, 2),
    slice(b32, 2),
    slice(d4, 7),
    slice(b33, 2),
    slice(b34, 2),
    slice(b41, 2),
    slice(b42, 2),
    slice(d4, 8),
    slice(b43, 2),
    slice(b44, 2)
  )

  retest_pool <- bind_rows(
    slice(b11, 3),
    slice(b12, 3),
    slice(d4, 9),
    slice(b13, 3),
    slice(b14, 3),
    slice(b21, 3),
    slice(b22, 3),
    slice(d4, 10),
    slice(b23, 3),
    slice(b24, 3),
    slice(b31, 3),
    slice(b32, 3),
    slice(d4, 11),
    slice(b33, 3),
    slice(b34, 3),
    slice(b41, 3),
    slice(b42, 3),
    slice(d4, 12),
    slice(b43, 3),
    slice(b44, 3)
  )

  masked_blocks <- block_mask_replace_paired(
    post_pool, retest_pool
  )

  post <- bind_rows(
    slice(p1, 2),
    slice(p2, 2),
    slice(p3, 2),
    slice(p4, 2),
    slice_sample(
        slice(masked_blocks[[1]], 1:5),
      prop = 1
    ),
    slice_sample(
        slice(masked_blocks[[1]], 6:10),
      prop = 1
    ),
    slice_sample(
        slice(masked_blocks[[1]], 11:15),
      prop = 1
    ),
    slice_sample(
        slice(masked_blocks[[1]], 16:20),
      prop = 1
    )
  )

  retest <- bind_rows(
    slice(p1, 3),
    slice(p2, 3),
    slice(p3, 3),
    slice(p4, 3),
    slice_sample(
        slice(masked_blocks[[2]], 1:5),
      prop = 1
    ),
    slice_sample(
        slice(masked_blocks[[2]], 6:10),
      prop = 1
    ),
    slice_sample(
        slice(masked_blocks[[2]], 11:15),
      prop = 1
    ),
    slice_sample(
        slice(masked_blocks[[2]], 16:20),
      prop = 1
    )
  )

  trial_rows <- bind_rows(
    pre,
    post,
    retest
  ) 
  
  trial_rows[, 2:4] <- t(apply(trial_rows[, 2:4], 1, sample))

  trials_df <- data.frame(
    id=ID,
    trial=TRIAL,
    type=trial_rows$Type,
    explain=EXPLAIN,
    card1=trial_rows$Card1,
    card2=trial_rows$Card2,
    card3=trial_rows$Card3,
    trialid=trial_rows$Trial_id,
    memory=as.integer(trial_rows$Replaced)
  )
  out_df <- rbind(out_df, trials_df)
}

write_csv(out_df, "stimuli.csv", append = FALSE)
