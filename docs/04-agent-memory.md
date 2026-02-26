# Agent Memory

At each step memory uses:
- last `kRecent` items
- optional one random older item with probability `explorationProb`

Random selection always goes through `RngPort`.
