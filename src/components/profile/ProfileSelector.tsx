import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Profile } from '../../types';
import { useProfiles } from '../../context/ProfileContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose,
  DialogTrigger
} from "@/components/ui/dialog";
import { PlusCircle, Trash2, User } from "lucide-react";
import { useLongPress } from "@/lib/use-long-press";

interface ProfileSelectorProps {
  onSelectProfile: (profile: Profile) => void;
  currentProfileId?: string;
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

const ProfileSelector: React.FC<ProfileSelectorProps> = ({ 
  onSelectProfile, 
  currentProfileId
}) => {
  const { profiles, addProfile, updateProfile, deleteProfile, setLastUsedProfile } = useProfiles();
  
  const [newProfileName, setNewProfileName] = useState("");
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleCreateProfile = () => {
    if (!newProfileName.trim()) return;
    
    const newProfile = addProfile(newProfileName);
    setNewProfileName("");
    setIsCreating(false);
    onSelectProfile(newProfile);
    
    // Set as last used profile
    setLastUsedProfile(newProfile.id);
  };
  
  const handleUpdateProfile = () => {
    if (!editingProfile || !editingProfile.name.trim()) return;
    
    updateProfile(editingProfile.id, editingProfile.name.trim());
    setEditingProfile(null);
    setIsEditing(false);
  };
  
  const handleDeleteProfile = () => {
    if (!editingProfile) return;
    
    deleteProfile(editingProfile.id);
    setEditingProfile(null);
    setIsDeleting(false);
  };
  
  const handleSelectProfile = (profile: Profile) => {
    // Update last used time
    setLastUsedProfile(profile.id);
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

export default ProfileSelector; 