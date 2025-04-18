import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";
import { Upload, FileText, Check, AlertCircle, X } from "lucide-react";
import { api } from "@/utils/api";
import { useTheme } from "@/contexts/ThemeContext";

interface ResumeUploadProps {
  onUploadSuccess?: (url: string) => void;
}

const ResumeUpload = ({ onUploadSuccess }: ResumeUploadProps) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

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
      toast.error("Please select a file to upload.");
      return;
    }
    
    if (!user?.id) {
      setError("You must be logged in to upload a resume.");
      toast.error("You must be logged in to upload a resume.");
      return;
    }
    
    try {
      setUploading(true);
      setError(null);
      setSuccess(null);
      
      const result = await api.uploadResume(file, user.id);
      
      if ('error' in result) {
        setError(result.error);
        toast.error(result.error);
      } else {
        setSuccess("Resume uploaded successfully!");
        setResumeUrl(result.url);
        toast.success("Resume uploaded successfully!");
        if (onUploadSuccess) {
          onUploadSuccess(result.url);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-[#1C1C1E] border-gray-200 dark:border-[#3A3A3C]">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-[#E5E5E7]">Upload Your Resume</h2>
      
      <div className="flex flex-col space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <label 
            htmlFor="resume-upload" 
            className="cursor-pointer inline-flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 dark:border-[#3A3A3C] bg-white dark:bg-[#2C2C2E] hover:bg-gray-50 dark:hover:bg-[#3A3A3C] transition-colors duration-300"
          >
            <FileText className="mr-2 h-4 w-4 text-[#3ECF8E]" />
            <span className="text-gray-800 dark:text-[#E5E5E7]">Browse Files</span>
          </label>
          
          <Button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="inline-flex items-center justify-center transition-all duration-300 focus:outline-none rounded-md px-4 py-2"
            style={{
              backgroundColor: '#3ECF8E',
              color: '#FFFFFF',
              opacity: !file || uploading ? 0.7 : 1
            }}
          >
            {uploading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Resume
              </>
            )}
          </Button>
        </div>
        
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
          id="resume-upload"
        />
        
        {file && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#2C2C2E] rounded-md border border-gray-200 dark:border-[#3A3A3C]">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-[#3ECF8E]" />
              <span className="text-sm font-medium truncate max-w-[200px] text-gray-800 dark:text-[#E5E5E7]">{file.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({Math.round(file.size / 1024)} KB)
              </span>
            </div>
            <button 
              onClick={() => setFile(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-[#E5E5E7]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        
        {error && (
          <div className="flex items-center p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {success && (
          <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md">
            <Check className="h-4 w-4 mr-2" />
            <p className="text-sm">{success}</p>
          </div>
        )}
        
        {resumeUrl && (
          <div className="mt-2">
            <a 
              href={resumeUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-[#3ECF8E] hover:underline flex items-center"
            >
              <FileText className="h-4 w-4 mr-1" />
              View Uploaded Resume
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeUpload;
