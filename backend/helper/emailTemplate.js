export const generatePRAnalysisEmail = ({
  repoName,
  prNumber,
  healthScore,
  status,
  dashboardUrl,
}) => {
  return `
    <div style="font-family: 'Inter', Arial, sans-serif; background: #f3f4f6; padding: 40px 0; margin: 0;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #2563eb, #1e40af); padding: 24px; color: #fff; text-align: center;">
          <h1 style="margin: 0; font-size: 22px;">🧠 MergeMind</h1>
          <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Pull Request Analysis Complete</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 28px;">
          <h2 style="color: #111827; margin-top: 0; font-size: 20px;">PR #${prNumber} Analyzed Successfully 🎉</h2>
          
          <p style="font-size: 15px; color: #374151; line-height: 1.6;">
            Your pull request has been analyzed by <b>MergeMind AI</b>. Here are the results:
          </p>

          <div style="margin: 20px 0; padding: 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px;"><b>📦 Repository:</b> <span style="color: #1e3a8a;">${repoName}</span></p>
            <p style="margin: 0 0 8px;"><b>🔢 PR Number:</b> #${prNumber}</p>
            <p style="margin: 0 0 8px;"><b>🩺 Health Score:</b> 
              <span style="
                background: ${
                  healthScore >= 80
                    ? "#dcfce7"
                    : healthScore >= 60
                    ? "#fef9c3"
                    : "#fee2e2"
                };
                color: ${
                  healthScore >= 80
                    ? "#166534"
                    : healthScore >= 60
                    ? "#854d0e"
                    : "#991b1b"
                };
                padding: 4px 10px;
                border-radius: 6px;
                font-weight: 600;
              ">
                ${healthScore}/100
              </span>
            </p>
            <p style="margin: 0;"><b>📊 Status:</b> ${status}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${dashboardUrl}" style="
              display: inline-block;
              background: linear-gradient(90deg, #2563eb, #1d4ed8);
              color: #fff;
              padding: 12px 24px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 600;
              transition: opacity 0.3s;
            ">View Full Report</a>
          </div>

          <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px;">
            Generated automatically by <b>MergeMind AI</b> 🚀 <br/>
            <span style="font-size: 12px;">&copy; 2025 MergeMind — Empowering better code intelligence.</span>
          </p>
        </div>
      </div>
    </div>
  `;
};
