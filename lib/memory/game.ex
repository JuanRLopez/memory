defmodule Memory.Game do
  def new do
    temp = %{
      num_clicks: 0,
      num_guesses: 0,
      selected_tiles: [],
      tiles: []
    }

    letters = ["A", "A", "B", "B", "C", "C", "D", "D", "E", "E", "F", "F", "G", "G", "H", "H"]

    tempTiles = Enum.reduce(letters, [], fn(letter, acc) ->
        cond do
          length(acc) == 0 -> List.insert_at(acc, 0,
          %{
            letter: letter,
            state: false,
            isCorrect: false
          })
          true -> List.insert_at(acc, :rand.uniform(length(acc)) - 1,
          %{
            letter: letter,
            state: false,
            is_correct: false
          })
        end
    end)
    Map.put(temp, :tiles, tempTiles)
  end

  def client_view(game) do
    %{
      tiles: game.tiles,
      num_clicks: game.num_clicks
    }
  end

  def restart(game) do
    new()
  end

  def handle_tile(game, tile_index) do
    cond do
      game.num_guesses != 2 ->
        game = Map.put(game, :num_guesses, game.num_guesses + 1)
        game = Map.put(game, :num_clicks, game.num_clicks + 1)
        game = Map.put(game, :selected_tiles, game.selected_tiles ++ [tile_index])
        game = update_tile(game, tile_index, :state, !Enum.at(game.tiles, tile_index).state)
        IO.puts "\n#{inspect(game)}\n"

        game = cond do
          game.num_guesses == 2 ->
            first_index = Enum.at(game.selected_tiles, 0)
            game = Map.put(game, :num_guesses, 0)
            game = Map.put(game, :selected_tiles, [])
            IO.puts "\n[2 GUESSES]\n"

            cond do
              Enum.at(game.tiles, tile_index).letter == Enum.at(game.tiles, first_index).letter ->
                # the guess was correct
                IO.puts "\n[TILES EQUAL]\n"
                game = update_tile(game, tile_index, :is_correct, true)
                game = update_tile(game, first_index, :is_correct, true)
                game

              true ->
                # the guess was wrong
                IO.puts "\n[TILES DONT EQUAL]\n"
                game = update_tile(game, tile_index, :state, false)
                game = update_tile(game, first_index, :state, false)
                # timeout for a bit
                #timeout = Task.async(Memory.Game, :timeout, [1000])
                #Task.await(timeout)
                game
            end
          true -> game
        end
        IO.puts "\n#{inspect(game)}\n"
        IO.puts "\n[END]\n"
        client_view(game)
        game
    end
  end

  def update_tile(game, index, key, new_val) do
    tile = Enum.at(game.tiles, index)
    tile = Map.put(tile, key, new_val)
    Map.put(game, :tiles, List.replace_at(game.tiles, index, tile))
  end

  def timeout(time) do
    :timer.sleep(time)
    true
  end
end
