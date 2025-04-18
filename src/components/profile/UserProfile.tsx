import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Input from "@/components/ui/Input";
import { toast } from "react-hot-toast";
import { supabase } from "@/utils/supabase"; // Assuming this path is correct
// Import the interface and utility functions
import { getUserProfile, updateUserProfile, UserProfile as IUserProfile } from "@/utils/userProfile";

const UserProfile = () => {
  // Initialize state using Partial<IUserProfile>
  // Use 'fullName' instead of 'name'
  const [profile, setProfile] = useState<Partial<IUserProfile>>({
    id: undefined,
    email: '',
    fullName: '',
    avatarUrl: '',
    skills: [],
    createdAt: '',
    updatedAt: '',
    phone: '',
    location: '',
    timeZone: '',
    githubUsername: '',
    linkedinUrl: '',
    website: '',
    role: '',
    interests: [],
    experienceLevel: '',
    availability: '',
    tasksCompleted: undefined,
    projectsCompleted: undefined,
    teamCollaborations: undefined,
  });
  

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching profile...");

      try {
        // Get authenticated user from Supabase
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setError("User not authenticated.");
          console.error("Auth Error:", authError);
          setLoading(false);
          return;
        }

        console.log("Authenticated user:", user.id, user.email);

        // Fetch user profile from MongoDB
        // Ensure getUserProfile returns the expected Collection type
        const collection = await getUserProfile();
        // IMPORTANT: Query using the correct field name where the Supabase user ID is stored in MongoDB.
        // Adjust 'userId' if your MongoDB documents use 'id' or '_id' for the Supabase user ID.
        const userProfileData = await collection.findOne({ userId: user.id }); // Or potentially { id: user.id }

        if (userProfileData) {
          console.log("Profile found in DB:", userProfileData);
          // Set state, ensuring email from auth is primary if needed
          setProfile({
            ...userProfileData,
            email: user.email ?? '',
            fullName: userProfileData.fullName ?? '', // One-time conversion
          });
          
        } else {
          console.log("User profile not found in DB. Initializing with auth email.");
          // If no profile exists, initialize with auth email and potentially ID
           setProfile(prev => ({
               ...prev, // Keep existing defaults
               id: user.id,
               email: user.email ?? '',
           }));
           // setError("User profile not found. Please complete your profile."); // Optional message
        }
      } catch (err: any) {
        console.error("Failed to load profile:", err);
        setError(`Failed to load profile: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // Run only on mount

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);
    console.log("Updating profile with state:", profile);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        setError("User not authenticated. Cannot update profile.");
        console.error("Auth Error on update:", authError);
        setLoading(false);
        return;
      }

      // Prepare data for update, excluding fields not meant for direct update if necessary
      // Ensure required fields are present if updateUserProfile expects them
      const profileToUpdate: Partial<IUserProfile> = {
        ...profile,
        // Ensure fullName is consistent or map back to full_name if DB uses that
        fullName: profile.fullName, // Use the state value
      // Ensure full_name is consistent or map back to fullName if DB uses that
        // Remove fields that shouldn't be directly updated by the user form if applicable
        // e.g., id, email, createdAt, updatedAt might be handled differently
      };
       // Remove potentially problematic fields before sending if needed
       // delete profileToUpdate.id;
       // delete profileToUpdate.email;
       // delete profileToUpdate.createdAt;

      console.log("Data being sent to updateUserProfile:", user.id, profileToUpdate);

      // Update user profile in MongoDB
      // Pass the Supabase user ID and the prepared profile data
      const success = await updateUserProfile(user.id, profileToUpdate);

      if (success) {
        console.log("Profile update successful.");
        toast.success("Profile updated successfully!");
        setIsEditing(false); // Exit editing mode on success
      } else {
        setError("Error updating profile in the database.");
        console.error("updateUserProfile returned false.");
      }
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      setError(`Failed to update profile: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">User Profile</h2>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)} size="sm">Edit Profile</Button>
        )}
      </div>


      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }} className="space-y-3">
        <Input
          //label="Full Name" // Add labels for accessibility
          id="fullName"
          type="text"
          placeholder="Enter your full name"
          // Use 'fullName' and provide empty string fallback for value
          value={profile.fullName ?? ''}
          onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}

          disabled={!isEditing || loading}
          required // Example: Mark as required
        />
        <Input
           //label="Email"
           id="email"
           type="email"
           // Provide empty string fallback for value
           value={profile.email ?? ''}
           disabled // Email usually shouldn't be changed here
        />
        <Input // Assuming Input component can handle multiline or use a TextArea component
          // label="Bio"
           id="bio"
           type="text" // Change to 'textarea' if Input supports it or use a TextArea component
           placeholder="Tell us about yourself"
           // Provide empty string fallback for value
           value={profile.bio ?? ''}
           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, bio: e.target.value })}
           disabled={!isEditing || loading}
        />
        <Input
          // label="Location"
           id="location"
           type="text"
           placeholder="City, Country"
           // Provide empty string fallback for value
           value={profile.location ?? ''}
           onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProfile({ ...profile, location: e.target.value })}
           disabled={!isEditing || loading}
        />
        {/* Add other profile fields as needed, applying the value={profile.fieldName ?? ''} pattern */}

        {isEditing && (
           <div className="flex justify-end mt-4 gap-2">
             <Button onClick={() => { setIsEditing(false); /* Optionally reset changes */ }} variant="outline" type="button" disabled={loading}>
               Cancel
             </Button>
             <Button type="submit" disabled={loading}>
               {loading ? "Saving..." : "Save Changes"}
             </Button>
           </div>
        )}
      </form>
       {!isEditing && loading && <p className="mt-4 text-center">Loading profile...</p>} {/* Show loading indicator when not editing */}
    </div>
  );
};

export default UserProfile;