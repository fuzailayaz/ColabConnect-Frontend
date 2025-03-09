import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input"; // Corrected import
import { getUserProfile, updateUserProfile } from "@/utils/api";
import { toast } from "react-hot-toast";

const UserProfile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getUserProfile();
        setProfile(response.data);
      } catch {
        setError("Failed to load profile.");
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await updateUserProfile(profile);
      if (response.status === 200) {
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError("Error updating profile.");
      }
    } catch {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-2">User Profile</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-3">
        <Input
          type="text"
          placeholder="Full Name"
          value={profile.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, name: e.target.value })}
          disabled={!isEditing}
        />
        <Input type="email" value={profile.email} disabled />
        <Input
          type="text"
          placeholder="Bio"
          value={profile.bio}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, bio: e.target.value })}
          disabled={!isEditing}
        />
        <Input
          type="text"
          placeholder="Location"
          value={profile.location}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, location: e.target.value })}
          disabled={!isEditing}
        />
      </div>

      <div className="flex justify-end mt-4 gap-2">
        {isEditing ? (
          <>
            <Button onClick={async () => { setIsEditing(false); return; }} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </>
        ) : (
          <Button onClick={async () => { setIsEditing(true); return; }}>Edit Profile</Button>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
