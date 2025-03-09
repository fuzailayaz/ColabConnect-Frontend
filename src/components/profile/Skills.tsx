import { useState, useEffect } from "react";
import Button from "@/components/ui/Button"; // Corrected import
import Input from "@/components/ui/Input"; // Corrected import
import { getSkills, addSkill, deleteSkill } from "@/utils/api"; // Ensure these functions are defined and exported

const Skills = () => {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await getSkills();
        setSkills(response.data.skills);
      } catch (err) {
        setError("Failed to fetch skills.");
      }
    };
    fetchSkills();
  }, []);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await addSkill({ skill: newSkill });
      if (response.status === 201) {
        setSkills([...skills, newSkill]);
        setNewSkill("");
      } else {
        setError("Error adding skill.");
      }
    } catch {
      setError("Failed to add skill.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillToDelete: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await deleteSkill(skillToDelete);
      if (response.status === 200) {
        setSkills(skills.filter((skill) => skill !== skillToDelete));
      } else {
        setError("Error deleting skill.");
      }
    } catch {
      setError("Failed to delete skill.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-2">Your Skills</h2>

      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-4 flex gap-2">
        <Input
          type="text"
          placeholder="Add a skill..."
          value={newSkill}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSkill(e.target.value)}
        />
        <Button onClick={handleAddSkill} disabled={loading || !newSkill.trim()}>
          {loading ? "Adding..." : "Add Skill"}
        </Button>
      </div>

      <ul className="space-y-2">
        {skills.map((skill, index) => (
          <li key={index} className="flex justify-between items-center border p-2 rounded-lg">
            <span>{skill}</span>
            <Button
              variant="destructive"
              onClick={() => handleDeleteSkill(skill)}
              disabled={loading}
            >
              ✕
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Skills;
