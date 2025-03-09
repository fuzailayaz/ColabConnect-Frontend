import { useState } from "react";
import Button from "@/components/ui/Button"; // Corrected import
import Input from "@/components/ui/Input"; // Corrected import
import { uploadResume } from "@/utils/api"; // Ensure this function is defined and exported

const ResumeUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setError(null);
      setSuccess(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await uploadResume(formData); // API call to backend
      if (response.status === 200) {
        setSuccess("Resume uploaded successfully!");
      } else {
        setError("Failed to upload resume.");
      }
    } catch (err) {
      setError("Error uploading file. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-900">
      <h2 className="text-lg font-semibold mb-2">Upload Your Resume</h2>
      <Input type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} />
      {error && <p className="text-red-500 mt-2">{error}</p>}
      {success && <p className="text-green-500 mt-2">{success}</p>}
      <Button
        onClick={handleUpload}
        className="mt-3"
        disabled={uploading || !file}
      >
        {uploading ? "Uploading..." : "Upload Resume"}
      </Button>
    </div>
  );
};

export default ResumeUpload;
