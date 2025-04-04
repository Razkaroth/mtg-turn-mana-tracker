import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, User } from "lucide-react";
import { useLongPress } from "@/lib/use-long-press";

export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  lastUsed?: number;
}

interface ProfileManagerProps {
  onSelectProfile: (profile: Profile) => void;
  currentProfileId?: string;
  availableProfiles?: Profile[];
  onProfileCreated?: (profile: Profile) => void;
}

// Create a separate component for profile button to handle longpress correctly
const ProfileButton: React.FC<{
  profile: Profile;
  isSelected: boolean;
  onSelect: (profile: Profile) => void;
  onLongPress: (profile: Profile) => void;
}> = ({ profile, isSelected, onSelect, onLongPress }) => {
  // Setup long press handler with proper callback
  const longPressHandlers = useLongPress<Profile>(() => {
    onLongPress(profile);
  });
  
  // Combine handlers to avoid duplication
  const handlers = {
    ...longPressHandlers(profile),
    onClick: () => onSelect(profile) // Override onClick to trigger selection
  };
  
  return (
    <Button
      key={profile.id}
      variant={isSelected ? "default" : "outline"}
      className={`h-auto py-2 px-3 justify-start ${
        isSelected ? "border-primary" : ""
      }`}
      {...handlers}
    >
      <div className="flex items-center gap-2 w-full overflow-hidden">
        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4" />
        </div>
        <div className="truncate">
          <div className="text-sm font-medium truncate">{profile.name}</div>
          <div className="text-xs text-muted-foreground">
            {new Date(profile.lastUsed || profile.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Button>
  );
};

export const ProfileManager: React.FC<ProfileManagerProps> = ({ 
  onSelectProfile, 
  currentProfileId,
  availableProfiles,
  onProfileCreated
}) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newProfileName, setNewProfileName] = useState("");
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load profiles from localStorage on first render if not provided externally
  useEffect(() => {
    if (availableProfiles) {
      setProfiles(availableProfiles);
    } else {
      const savedProfiles = localStorage.getItem('mtg-profiles');
      if (savedProfiles) {
        try {
          const parsedProfiles = JSON.parse(savedProfiles);
          setProfiles(parsedProfiles);
        } catch (error) {
          console.error('Failed to parse profiles:', error);
        }
      }
    }
  }, [availableProfiles]);
  
  // Save profiles to localStorage whenever they change if we're not using external profiles
  useEffect(() => {
    if (!availableProfiles && profiles.length > 0) {
      localStorage.setItem('mtg-profiles', JSON.stringify(profiles));
    }
  }, [profiles, availableProfiles]);
  
  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    
    const newProfile: Profile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      createdAt: Date.now(),
      lastUsed: Date.now()
    };
    
    if (availableProfiles && onProfileCreated) {
      // If using external profile management
      onProfileCreated(newProfile);
    } else {
      // Using internal profile management
      setProfiles(prev => [...prev, newProfile]);
      onSelectProfile(newProfile);
    }
    
    setNewProfileName("");
    setIsCreating(false);
  };
  
  const handleUpdateProfile = () => {
    if (!editingProfile || !editingProfile.name.trim()) return;
    
    setProfiles(prev => 
      prev.map(profile => 
        profile.id === editingProfile.id 
          ? { ...editingProfile, name: editingProfile.name.trim() } 
          : profile
      )
    );
    
    setEditingProfile(null);
    setIsEditing(false);
  };
  
  const handleDeleteProfile = () => {
    if (!editingProfile) return;
    
    setProfiles(prev => prev.filter(profile => profile.id !== editingProfile.id));
    
    // If the deleted profile was the current one, select another profile
    if (editingProfile.id === currentProfileId && profiles.length > 1) {
      const otherProfile = profiles.find(p => p.id !== editingProfile.id);
      if (otherProfile) onSelectProfile(otherProfile);
    }
    
    setEditingProfile(null);
    setIsDeleting(false);
  };
  
  const handleSelectProfile = (profile: Profile) => {
    // Update last used time
    setProfiles(prev => 
      prev.map(p => 
        p.id === profile.id 
          ? { ...p, lastUsed: Date.now() } 
          : p
      )
    );
    
    onSelectProfile(profile);
  };
  
  const handleLongPress = (profile: Profile) => {
    setEditingProfile(profile);
    setIsEditing(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Player Profiles</h2>
        
        {/* Create Profile Dialog */}
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1">
              <PlusCircle className="h-4 w-4" />
              New Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Profile</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter player name"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreateProfile()}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateProfile} disabled={!newProfileName.trim()}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Profile List */}
      <div className="grid grid-cols-2 gap-2">
        {profiles.map(profile => (
          <ProfileButton
            key={profile.id}
            profile={profile}
            isSelected={profile.id === currentProfileId}
            onSelect={handleSelectProfile}
            onLongPress={handleLongPress}
          />
        ))}
      </div>
      
      {/* If no profiles exist, show message */}
      {profiles.length === 0 && (
        <div className="text-center p-4 bg-muted/30 rounded-md">
          <p className="text-muted-foreground mb-2">No profiles created yet</p>
          <Button 
            onClick={() => setIsCreating(true)} 
            variant="outline" 
            size="sm"
          >
            Create Your First Profile
          </Button>
        </div>
      )}
      
      {/* Edit Profile Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Enter player name"
              value={editingProfile?.name || ""}
              onChange={(e) => setEditingProfile(prev => 
                prev ? { ...prev, name: e.target.value } : null
              )}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleUpdateProfile()}
            />
          </div>
          <DialogFooter className="flex justify-between">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setIsDeleting(true);
              }}
              className="gap-1"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <div className="space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleUpdateProfile} 
                disabled={!editingProfile?.name.trim()}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to delete "{editingProfile?.name}"?</p>
            <p className="text-sm text-muted-foreground mt-1">This action cannot be undone.</p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProfile}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 