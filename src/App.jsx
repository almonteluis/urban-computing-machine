import { useState, useEffect } from "react";
import { BalldontlieAPI } from "@balldontlie/sdk";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  TrendingUp,
} from "lucide-react";
import "./App.css";

const api = new BalldontlieAPI({
  apiKey: import.meta.env.VITE_BALDLIE_API_KEY,
});

// Player ID mapping for popular players (balldontlie ID -> NBA.com ID)
const PLAYER_ID_MAPPING = {
  // Popular players - you can expand this list
  19: "201939", // Stephen Curry
  15: "203507", // Giannis Antetokounmpo
  246: "203999", // Nikola Jokic
  237: "203076", // Anthony Davis
  // Add more mappings as needed
};

// Image component with name-based fallback handling
const PlayerImage = ({ player, className, style, alt, size = "150x150" }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [googleImageUrl, setGoogleImageUrl] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  const teamAbbr = player.team?.abbreviation || "";
  const nbaId = PLAYER_ID_MAPPING[player.id]; // Check if we have a mapping
  const playerName = `${player.first_name || ""} ${
    player.last_name || ""
  }`.trim();

  // Search for Google image when component mounts
  useEffect(() => {
    const searchForImage = async () => {
      if (!googleImageUrl && !isSearching && playerName) {
        setIsSearching(true);
        const imageUrl = await searchPlayerImage(playerName);
        setGoogleImageUrl(imageUrl);
        setIsSearching(false);
      }
    };

    searchForImage();
  }, [player.id, playerName, googleImageUrl, isSearching]);

  // Try different image strategies
  const imageSources = [
    // Strategy 1: Use Google search result if available
    googleImageUrl,

    // Strategy 2: Use mapped NBA ID if available
    nbaId
      ? `https://cdn.nba.com/headshots/nba/latest/1040x760/${nbaId}.png`
      : null,
    nbaId
      ? `https://a.espncdn.com/i/headshots/nba/players/full/${nbaId}.png`
      : null,

    // Strategy 3: Try with balldontlie ID (unlikely to work)
    `https://cdn.nba.com/headshots/nba/latest/1040x760/${player.id}.png`,

    // Strategy 4: Team logo fallback
    teamAbbr
      ? `https://cdn.nba.com/logos/nba/${player.team.id}/global/L/logo.svg`
      : null,

    // Strategy 5: Placeholder with initials
    `https://via.placeholder.com/${size}/6B7280/FFFFFF?text=${
      player.first_name?.[0] || "P"
    }${player.last_name?.[0] || "L"}`,
  ].filter(Boolean);

  const handleImageError = () => {
    if (currentImageIndex < imageSources.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  useEffect(() => {
    setCurrentImageIndex(0);
    setGoogleImageUrl(null); // Reset Google image when player changes
  }, [player.id]);

  // Show loading placeholder while searching
  if (isSearching && currentImageIndex === 0) {
    return (
      <div
        className={`${className} bg-gray-600 flex items-center justify-center`}
        style={style}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <img
      src={imageSources[currentImageIndex]}
      alt={alt}
      className={className}
      style={style}
      onError={handleImageError}
    />
  );
};

const PlayerCard = ({
  player,
  viewMode,
  onPlayerClick,
  isFavorite,
  onToggleFavorite,
}) => {
  const cardClass =
    viewMode === "grid"
      ? "bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-all duration-300 cursor-pointer transform hover:scale-105"
      : "bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-all duration-300 cursor-pointer flex items-center space-x-4";

  const playerName = `${player.first_name || ""} ${
    player.last_name || ""
  }`.trim();
  const teamName = player.team?.full_name || "Unknown Team";
  const teamColor = "#6B7280"; // Default gray color

  return (
    <div className={cardClass} onClick={() => onPlayerClick(player)}>
      {viewMode === "grid" ? (
        <>
          <div className="flex justify-between items-start mb-4">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: teamColor }}
            ></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(player.id);
              }}
              className={`p-1 rounded-full transition-colors ${
                isFavorite
                  ? "text-yellow-400"
                  : "text-gray-400 hover:text-yellow-400"
              }`}
            >
              <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>

          <div className="text-center">
            <PlayerImage
              player={player}
              alt={playerName}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-2"
              style={{ borderColor: teamColor }}
              size="150x150"
            />
            <h3 className="text-white font-bold text-lg mb-1">{playerName}</h3>
            <p className="text-gray-400 text-sm mb-2">
              {player.position || "N/A"} • {teamName}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center">
                <p className="text-white font-bold">--</p>
                <p className="text-gray-400 text-xs">PPG</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold">--</p>
                <p className="text-gray-400 text-xs">RPG</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold">--</p>
                <p className="text-gray-400 text-xs">APG</p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <PlayerImage
            player={player}
            alt={playerName}
            className="w-16 h-16 rounded-full border-2"
            style={{ borderColor: teamColor }}
            size="150x150"
          />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-white font-bold text-lg">{playerName}</h3>
                <p className="text-gray-400">
                  {player.position || "N/A"} • {teamName}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(player.id);
                }}
                className={`p-1 rounded-full transition-colors ${
                  isFavorite
                    ? "text-yellow-400"
                    : "text-gray-400 hover:text-yellow-400"
                }`}
              >
                <Star size={16} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
            <div className="flex space-x-6 mt-2">
              <span className="text-white">-- PPG</span>
              <span className="text-white">-- RPG</span>
              <span className="text-white">-- APG</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PlayerModal = ({ player, isOpen, onClose }) => {
  if (!isOpen || !player) return null;

  const playerName = `${player.first_name || ""} ${
    player.last_name || ""
  }`.trim();
  const teamName = player.team?.full_name || "Unknown Team";
  const teamColor = "#6B7280"; // Default gray color

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-white">Player Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="text-center md:text-left">
              <PlayerImage
                player={player}
                alt={playerName}
                className="w-32 h-32 rounded-full mx-auto md:mx-0 border-4"
                style={{ borderColor: teamColor }}
                size="200x200"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white mb-2">
                {playerName}
              </h3>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl">🏀</span>
                <span className="text-gray-300">{teamName}</span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-300">
                  {player.position || "N/A"}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-300">
                  {player.team?.conference || "Unknown"} Conference
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">
                    {player.height_feet
                      ? `${player.height_feet}'${player.height_inches || 0}"`
                      : "N/A"}
                  </p>
                  <p className="text-gray-400">Height</p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-white">
                    {player.weight_pounds
                      ? `${player.weight_pounds} lbs`
                      : "N/A"}
                  </p>
                  <p className="text-gray-400">Weight</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h4 className="text-white font-bold mb-2">Additional Info</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-300">
                    <span className="text-gray-400">Team:</span> {teamName}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Position:</span>{" "}
                    {player.position || "N/A"}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Conference:</span>{" "}
                    {player.team?.conference || "Unknown"}
                  </p>
                  <p className="text-gray-300">
                    <span className="text-gray-400">Division:</span>{" "}
                    {player.team?.division || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Search for player images using Google Custom Search API
const searchPlayerImage = async (playerName) => {
  try {
    // Get API keys from Google Cloud Console
    // 1. Enable Custom Search API: https://console.cloud.google.com/apis/library/customsearch.googleapis.com
    // 2. Create Custom Search Engine: https://cse.google.com/cse/
    const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
    const GOOGLE_CX = import.meta.env.VITE_GOOGLE_CX; // Custom Search Engine ID

    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      return null;
    }

    const query = `${playerName} NBA player headshot`;
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(
        query
      )}&searchType=image&num=1&imgSize=medium&imgType=photo&safe=active`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.items?.[0]?.link || null;
  } catch {
    return null;
  }
};

const App = () => {
  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedConference, setSelectedConference] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [favorites, setFavorites] = useState(new Set());
  const teams = [
    ...new Set(players.map((player) => player.team?.full_name).filter(Boolean)),
  ];
  const positions = [
    ...new Set(players.map((player) => player.position).filter(Boolean)),
  ];
  const conferences = [
    ...new Set(
      players.map((player) => player.team?.conference).filter(Boolean)
    ),
  ];

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const players = await api.nba.getPlayers();
        setPlayers(players.data);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    let filtered = players;

    if (searchTerm) {
      filtered = filtered.filter((player) => {
        const fullName = `${player.first_name || ""} ${
          player.last_name || ""
        }`.toLowerCase();
        const teamName = player.team?.full_name?.toLowerCase() || "";
        return (
          fullName.includes(searchTerm.toLowerCase()) ||
          teamName.includes(searchTerm.toLowerCase())
        );
      });
    }

    if (selectedTeam !== "all") {
      filtered = filtered.filter(
        (player) => player.team?.full_name === selectedTeam
      );
    }

    if (selectedPosition !== "all") {
      filtered = filtered.filter(
        (player) => player.position === selectedPosition
      );
    }

    if (selectedConference !== "all") {
      filtered = filtered.filter(
        (player) => player.team?.conference === selectedConference
      );
    }

    setFilteredPlayers(filtered);
  }, [searchTerm, selectedTeam, selectedPosition, selectedConference, players]);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
  };

  const handleToggleFavorite = (playerId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(playerId)) {
      newFavorites.delete(playerId);
    } else {
      newFavorites.add(playerId);
    }
    setFavorites(newFavorites);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white">
                🏀 NBA Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Search players or teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none w-64"
                />
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center">
                <Filter size={20} className="mr-2" />
                Filters
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Conference
                  </label>
                  <select
                    value={selectedConference}
                    onChange={(e) => setSelectedConference(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Conferences</option>
                    {conferences.map((conference) => (
                      <option key={conference} value={conference}>
                        {conference}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Team
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Teams</option>
                    {teams.map((team) => (
                      <option key={team} value={team}>
                        {team}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Position
                  </label>
                  <select
                    value={selectedPosition}
                    onChange={(e) => setSelectedPosition(e.target.value)}
                    className="w-full bg-gray-700 text-white rounded-lg border border-gray-600 px-3 py-2 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="all">All Positions</option>
                    {positions.map((position) => (
                      <option key={position} value={position}>
                        {position}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4 flex items-center">
                <TrendingUp size={20} className="mr-2" />
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Total Players</span>
                  <span className="text-white font-bold">
                    {filteredPlayers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Favorites</span>
                  <span className="text-yellow-400 font-bold">
                    {favorites.size}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Teams</span>
                  <span className="text-white font-bold">{teams.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                NBA Players {selectedTeam !== "all" && `- ${selectedTeam}`}
              </h2>
              <p className="text-gray-400">
                Showing {filteredPlayers.length} player
                {filteredPlayers.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Players Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-4"
              }
            >
              {filteredPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  viewMode={viewMode}
                  onPlayerClick={handlePlayerClick}
                  isFavorite={favorites.has(player.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏀</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No players found
                </h3>
                <p className="text-gray-400">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Detail Modal */}
      <PlayerModal
        player={selectedPlayer}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default App;
