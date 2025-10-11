import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router";
import { Github, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { connectRepoManually } from "../lib/api";

const ConnectRepository = () => {
  const navigate = useNavigate();
  const [repoId, setRepoId] = useState("");

  const handleSubmit = async () => {
    try {
      if (!repoId.trim()) {
        toast.error("Please enter a valid Repository ID");
        return;
      }
      await connectRepoManually({ repoId: repoId.trim() });
      toast.success("Repository connected successfully");
      setRepoId("");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error connecting repository:", error);
      toast.error(
        error.response?.data?.message || "Failed to connect repository"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <div className="pt-24 w-[88%] mx-auto">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Github className="text-blue-600" /> Connect a New Repository 🚀
              </h1>
              <p className="text-gray-500 mt-2">
                Enter your GitHub repository ID to connect it for analysis.
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          {/* Input and Button */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="repoId"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Repository ID
              </label>
              <input
                id="repoId"
                type="text"
                placeholder="e.g. 123456789"
                value={repoId}
                onChange={(e) => setRepoId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-400 transition-all"
              />
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Connect Repository
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              🧩 Find Repository ID using Inspect Element
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700 text-sm leading-relaxed">
              <li>
                Open your repository page on GitHub — e.g.,{" "}
                <strong>github.com/&lt;owner&gt;/&lt;repo-name&gt;</strong>.
              </li>
              <li>
                Right-click anywhere on the page and choose{" "}
                <strong>“Inspect”</strong> (or press <kbd>Ctrl</kbd> +{" "}
                <kbd>Shift</kbd> + <kbd>I</kbd>).
              </li>
              <li>
                Go to the <strong>Network</strong> tab in the Developer Tools.
              </li>
              <li>
                Reload the page (<kbd>F5</kbd> or <kbd>Ctrl</kbd> + <kbd>R</kbd>
                ).
              </li>
              <li>
                In the Network tab, search for a request named{" "}
                <strong>“repository”</strong> or <strong>“graphql”</strong>.
              </li>
              <li>
                Click the request, then open the <strong>Response</strong> or{" "}
                <strong>Preview</strong> tab — look for:
                <div className="bg-gray-100 text-gray-700 rounded-md p-2 mt-2 font-mono text-xs">
                  "id": 123456789
                </div>
                That’s your <strong>repository ID</strong>.
              </li>
              <li>Copy it and paste it into the input field above.</li>
            </ol>
            <p className="text-gray-600 mt-4 text-sm">
              💡 Tip: You can also search <kbd>Ctrl</kbd> + <kbd>F</kbd> → type
              “id” in the response preview to find it quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectRepository;
