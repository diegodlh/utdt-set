library(gtools)
library(tidyverse)

# 1. Generate the deck
levels <- 1:3
deck_df <- expand.grid(Shape = levels, Color = levels, Texture = levels, Number = levels)
deck <- apply(deck_df, 1, paste, collapse = "")

# 2. Generate all unique combinations of 3 cards (order doesn't matter)
all_triads_comb <- combinations(n = length(deck), r = 3, v = deck)

# 3. SET validation function (The "Sum mod 3" trick)
is_set <- function(triad) {
  chars <- strsplit(triad, "")
  mat <- matrix(as.numeric(unlist(chars)), nrow = 3, byrow = TRUE)
  col_sums <- colSums(mat)
  return(all(col_sums %% 3 == 0))
}

# 4. Apply validation
validity_comb <- apply(all_triads_comb, 1, is_set)

# 5. Create final dataframe
results_comb <- data.frame(
  Card1 = all_triads_comb[,1],
  Card2 = all_triads_comb[,2],
  Card3 = all_triads_comb[,3],
  Status = ifelse(validity_comb, "Set", "No set")
)

analyze_triad <- function(triad) {
  # 1. Parse strings into a matrix (3x4)
  chars <- strsplit(triad, "")
  mat <- matrix(as.numeric(unlist(chars)), nrow = 3, byrow = TRUE)
  
  # 2. Evaluate each attribute (column)
  # A SET attribute is valid if all values are same OR all are different
  is_valid_attr <- apply(mat, 2, function(col) {
    length(unique(col)) != 2  # If unique count is 1 or 3, it's valid. If 2, it's broken.
  })
  
  # 3. Determine if attribute is "Same" (1) or "Different" (0) 
  # This is only logically consistent for Valid attributes.
  # We'll code "All Same" as 1 and "All Different" as 0.
  attr_type <- apply(mat, 2, function(col) {
    if(length(unique(col)) == 1) return("1") # All same
    if(length(unique(col)) == 3) return("0") # All different
    return("X") # Placeholder for broken
  })
  
  # 4. Construct the strings
  matching_attr <- paste(ifelse(attr_type == "X", "0", attr_type), collapse = "")
  broken_attr <- paste(as.numeric(!is_valid_attr), collapse = "")
  
  return(c(matching_attr, broken_attr))
}

# Apply the analysis
analysis_results <- t(apply(all_triads_comb, 1, analyze_triad))

# Update Dataframe
results_comb$Matching_Attributes <- analysis_results[,1]
results_comb$Broken_Attributes <- analysis_results[,2]

trials <- results_comb |>
  mutate(
    Type = if_else(Status == "Set", strtoi(Matching_Attributes, base = 2), strtoi(Broken_Attributes, base = 2)*-1),
    Matching_Attributes = if_else(Status == "Set", as.character(Matching_Attributes), NA),
    Broken_Attributes = if_else(Status == "Set", NA, as.character(Broken_Attributes))
  )

for (i in deck){
  trials <- rbind(
    trials,
    c(i, i, i, "Set", "1111", NA, 15)
  )
}

write.csv(trials, "trials.csv", row.names = FALSE)
