import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  LogOut,
  Settings,
  Bell,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { useNavSearch } from "@/hooks/useNavSearch";
import { SearchResults } from "./SearchResults";
import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";

export function MainNavbar() {
  const { user, logout } = useAuth();
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    navigateToResult,
  } = useNavSearch();
  const { t } = useTranslation();

  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    await logout();
  };

  const handleInputFocus = () => {
    setShowResults(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowResults(true);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleSelectResult = (path: string) => {
    navigateToResult(path);
    setShowResults(false);
  };

  // Handle clicks outside the search component
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close search results on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowResults(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div
      className="flex items-center justify-between w-full"
      style={{ height: "clamp(3.5rem, 5vw, 4rem)" }}
    >
      {/* Brand/Logo Section */}
      <div className="flex items-center min-w-0 flex-shrink-0">
        <Link
          to="/dashboard"
          className="flex items-center gap-responsive group"
        >
          <div
            className="bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-lg group-hover:shadow-primary/30 group-hover:scale-105 transition-all duration-300"
            style={{
              width: "clamp(2rem, 3vw, 2.5rem)",
              height: "clamp(2rem, 3vw, 2.5rem)",
              fontSize: "clamp(0.875rem, 1.5vw, 1.125rem)",
            }}
          >
            D
          </div>
          <span className="text-responsive-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300 hidden sm:block">
            DocuVerse
          </span>
        </Link>
      </div>

      {/* Central Search Bar - Enhanced Design with Responsive Sizing */}
      <div
        className="flex-1 mx-4 sm:mx-6 lg:mx-8 hidden md:block"
        style={{ maxWidth: "clamp(20rem, 50vw, 42rem)" }}
        ref={searchRef}
      >
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
          <div className="relative flex items-center">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground group-hover:text-primary transition-colors duration-300 z-10"
              style={{
                width: "clamp(1rem, 2vw, 1.25rem)",
                height: "clamp(1rem, 2vw, 1.25rem)",
              }}
            />
            <Input
              className="input-responsive bg-muted/60 border-2 border-border hover:border-primary/30 focus:border-primary text-foreground placeholder:text-muted-foreground w-full rounded-xl transition-all duration-300 backdrop-blur-md shadow-inner group-hover:bg-muted/80 focus:bg-card/90"
              style={{
                paddingLeft: "clamp(2.75rem, 4vw, 3.5rem)",
                paddingRight: "clamp(2.75rem, 4vw, 3.5rem)",
                paddingTop: "clamp(0.5rem, 1.5vw, 0.75rem)",
                paddingBottom: "clamp(0.5rem, 1.5vw, 0.75rem)",
              }}
              placeholder={t("navigation.searchPlaceholder")}
              value={searchQuery}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-all duration-200"
                style={{
                  width: "clamp(1.5rem, 2.5vw, 1.75rem)",
                  height: "clamp(1.5rem, 2.5vw, 1.75rem)",
                }}
                onClick={handleClearSearch}
              >
                <X
                  style={{
                    width: "clamp(0.875rem, 1.5vw, 1rem)",
                    height: "clamp(0.875rem, 1.5vw, 1rem)",
                  }}
                />
              </Button>
            )}
          </div>
        </div>

        {/* Enhanced Search Results */}
        {showResults && (
          <SearchResults
            results={searchResults}
            isSearching={isSearching}
            onSelect={handleSelectResult}
            searchQuery={searchQuery}
          />
        )}
      </div>

      {/* Right Section - User Actions */}
      {user ? (
        <div className="flex items-center gap-responsive flex-shrink-0">
          {/* Clean Notification Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 rounded-lg btn-responsive"
          >
            <Bell
              style={{
                width: "clamp(1rem, 2vw, 1.25rem)",
                height: "clamp(1rem, 2vw, 1.25rem)",
              }}
            />
            <span
              className="absolute -top-1 -right-1 bg-destructive rounded-full ring-1 ring-background"
              style={{
                width: "clamp(0.5rem, 1vw, 0.625rem)",
                height: "clamp(0.5rem, 1vw, 0.625rem)",
              }}
            ></span>
          </Button>

          {/* Clean User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-responsive text-foreground hover:bg-accent/50 transition-all duration-200 btn-responsive rounded-lg h-auto"
              >
                <div className="hidden lg:block text-right">
                  <p className="text-responsive-sm font-medium text-foreground leading-tight">
                    {user.username || "User"}
                  </p>
                  <p className="text-responsive-xs text-muted-foreground uppercase tracking-wide">
                    {user.role}
                  </p>
                </div>
                <Avatar
                  className="ring-1 ring-border"
                  style={{
                    width: "clamp(1.75rem, 3vw, 2.25rem)",
                    height: "clamp(1.75rem, 3vw, 2.25rem)",
                  }}
                >
                  <AvatarImage
                    src={user.profilePicture}
                    alt={user.username || "User"}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium text-responsive-sm">
                    {user.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown
                  className="text-muted-foreground hidden lg:block"
                  style={{
                    width: "clamp(0.875rem, 1.5vw, 1rem)",
                    height: "clamp(0.875rem, 1.5vw, 1rem)",
                  }}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 bg-popover/95 backdrop-blur-sm border-border text-popover-foreground shadow-lg"
            >
              <DropdownMenuLabel className="text-foreground font-medium">
                {t("navigation.myAccount")}
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link
                  to="/profile"
                  className="flex items-center cursor-pointer w-full"
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>{t("navigation.profile")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuItem asChild>
                <Link
                  to="/settings"
                  className="flex items-center cursor-pointer w-full"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("navigation.settings")}</span>
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="flex items-center cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("nav.logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <Link to="/login">
            <Button variant="ghost" className="text-foreground hover:bg-accent">
              {t("auth.signIn")}
            </Button>
          </Link>
          <Link to="/register">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              {t("auth.signUp")}
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
