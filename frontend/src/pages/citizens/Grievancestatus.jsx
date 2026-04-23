import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getGrievanceById } from "../../api/grievance";
import { getComments, addComment, deleteComment } from "../../api/comment";
import { getFeedback, submitFeedback } from "../../api/feedback";
import Navbar from "../../components/Navbar";
import { useTranslation } from "react-i18next";

// STATUS CONFIG 
const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "text-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    dot: "bg-yellow-400",
    icon: "⏳",
  },
  in_progress: {
    label: "In Progress",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/30",
    dot: "bg-blue-400",
    icon: "🔄",
  },
  resolved: {
    label: "Resolved",
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/30",
    dot: "bg-green-400",
    icon: "✅",
  },
  rejected: {
    label: "Rejected",
    color: "text-red-400",
    bg: "bg-red-500/10 border-red-500/30",
    dot: "bg-red-400",
    icon: "❌",
  },
};

// PRIORITY BADGE 
const PriorityBadge = ({ score }) => {
  const { t } = useTranslation();
  if (score == null) return <span className="text-gray-500">{t("na")}</span>;

  const level =
    score >= 8
      ? { label: "critical", color: "text-red-400 bg-red-500/10 border-red-500/30" }
      : score >= 5
      ? { label: "high", color: "text-orange-400 bg-orange-500/10 border-orange-500/30" }
      : score >= 3
      ? { label: "medium", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" }
      : { label: "low", color: "text-green-400 bg-green-500/10 border-green-500/30" };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${level.color}`}>
      {t(level.label)} ({score})
    </span>
  );
};


//  STAR RATING 
const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => !readonly && onChange && onChange(s)}
        className={`text-2xl ${!readonly ? "hover:scale-110 cursor-pointer" : ""} ${
          s <= value ? "text-yellow-400" : "text-gray-600"
        }`}
      >
        ★
      </button>
    ))}
  </div>
);


//SECTION CARD 
const Section = ({ title, icon, children }) => (
  <div className="bg-[#2a2a2f] border border-gray-700/60 rounded-2xl p-6">
    <h3 className="text-[#e8d4a2] font-semibold text-lg mb-5 flex items-center gap-2">
      <span>{icon}</span> {title}
    </h3>
    {children}
  </div>
);

// FIELD 
const Field = ({ label, children }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase mb-1">{label}</p>
    <div className="text-gray-200 text-sm">{children}</div>
  </div>
);
const GrievanceStatus = () => {
  const { t } = useTranslation();  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const grievanceId = searchParams.get("id");
  const user = JSON.parse(localStorage.getItem("user"));

  // State
  const [grievance, setGrievance] = useState(null);
  const [comments, setComments] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Comment form
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 0,
    resolved: true,
    comments: "",
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    if (!grievanceId) {
      setError(t("noGrievanceId"));
      setLoading(false);
      return;
    } 
    

    const fetchAll = async () => {
      try {
        const [gRes, cRes] = await Promise.all([
          getGrievanceById(grievanceId),
          getComments(grievanceId),
        ]);

        setGrievance(gRes?.data?.data || gRes?.data);
        setComments(cRes?.data?.data || cRes?.data || []);

        try {
          const fRes = await getFeedback(grievanceId);
          const fb = fRes?.data?.data || fRes?.data;
          if (fb) {
            setFeedback(fb);
            setFeedbackSubmitted(true);
          }
        } catch (_) {}
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load grievance.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [grievanceId]);

  // ADD COMMENT
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      setSubmittingComment(true);
      const res = await addComment(grievanceId, newComment.trim());
      const added = res?.data?.data || res?.data;
      setComments((prev) => [...prev, added]);
      setNewComment("");
    } catch (err) {
      console.error("Add comment failed:", err);
    } finally {
      setSubmittingComment(false);
    }
  };

  //  DELETE COMMENT 
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      console.error("Delete comment failed:", err);
    }
  };

  //SUBMIT FEEDBACK
  const handleSubmitFeedback = async () => {
    if (feedbackForm.rating === 0) {
      alert(t("giveRating"));
      return;
    }
    try {
      setSubmittingFeedback(true);
      const res = await submitFeedback(grievanceId, feedbackForm);
      setFeedback(res?.data?.data || res?.data);
      setFeedbackSubmitted(true);
    } catch (err) {
      console.error("Feedback submit failed:", err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // STATUS CONFIG HELPERS
  const statusCfg = STATUS_CONFIG[grievance?.status] || STATUS_CONFIG["pending"];

  //  RENDER
  return (
    <div className="min-h-screen bg-[#1f1f23] text-white">
      <Navbar
        user={user}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />

      <div className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          ← Back to Complaints
        </button>

        {/* LOADING / ERROR */}
        {loading && (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-[#6c584c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl">
            {error}
          </div>
        )}

        {!loading && grievance && (
          <div className="space-y-6">

            {/*COMPLAINT CARD*/}
            <div className={`bg-[#2a2a2f] border rounded-2xl p-7 shadow-xl ${statusCfg.bg}`}>

              {/* Header row */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                    Grievance ID
                  </p>
                  <p className="text-gray-300 text-sm font-mono break-all">
                    {grievance._id}
                  </p>
                </div>

                {/* Status badge */}
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${statusCfg.bg} ${statusCfg.color}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${statusCfg.dot} ${
                      grievance.status === "pending" || grievance.status === "in_progress"
                        ? "animate-pulse"
                        : ""
                    }`}
                  />
                  {statusCfg.icon} {statusCfg.label}
                </div>
              </div>

              {/* Title / complaint text */}
              <div className="mb-6">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                  Your Complaint
                </p>
                <p className="text-white text-base leading-relaxed bg-[#1f1f23] border border-gray-700 rounded-xl p-4">
                  {grievance.originalText}
                </p>
              </div>

              {/* Summary if available */}
              {grievance.summaryText && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    AI Summary
                  </p>
                  <p className="text-gray-300 text-sm italic bg-[#1a1a1e] border border-gray-700/50 rounded-xl p-4">
                    "{grievance.summaryText}"
                  </p>
                </div>
              )}

              {/* Detail grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                <Field label="Category">
                  <span className="capitalize">{grievance.category || "N/A"}</span>
                </Field>

                <Field label="Sub-Category">
                  <span className="capitalize">{grievance.subCategory || "N/A"}</span>
                </Field>

                <Field label="Priority">
                  <PriorityBadge score={grievance.priorityScore} t={t} />
                </Field>

                <Field label="District">
                  📍 {grievance.district || "N/A"}
                </Field>

                <Field label="Pincode">
                  {grievance.pincode || "N/A"}
                </Field>

                <Field label="Language">
                  {grievance.originalLanguage?.toUpperCase() || "EN"}
                </Field>

                <Field label="Submitted">
                  {new Date(grievance.createdAt).toLocaleString()}
                </Field>

                <Field label="Last Updated">
                  {new Date(grievance.updatedAt).toLocaleString()}
                </Field>

                {grievance.departmentId && (
                  <Field label="Department">
                    {grievance.departmentId.name || "—"}
                  </Field>
                )}

                {grievance.assignedOfficerId && (
                  <Field label="Assigned Officer">
                    {grievance.assignedOfficerId.name} (@
                    {grievance.assignedOfficerId.username})
                  </Field>
                )}
              </div>

              {/* Keywords */}
              {grievance.keywords?.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Keywords
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {grievance.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-3 py-0.5 text-xs rounded-full bg-[#6c584c]/30 border border-[#6c584c]/40 text-[#e8d4a2]"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachment */}
              {grievance.input_url && (
                <div className="mt-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Attachment
                  </p>
                  <a
                    href={grievance.input_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:underline"
                  >
                    📎 View Attached File
                  </a>
                </div>
              )}

              {/* Edit button — only for pending */}
              {grievance.status === "pending" && (
                <div className="mt-6 pt-5 border-t border-gray-700/50 flex gap-3">
                  <button
                    onClick={() =>
                      navigate(`/dashboard/create?id=${grievance._id}`)
                    }
                    className="px-4 py-2 bg-blue-600/80 hover:bg-blue-600 rounded-lg text-sm transition"
                  >
                    ✏️ {t("editComplaint")}
                  </button>
                </div>
              )}
            </div>

            {/* COMMENTS SECTION  */}
            <Section title={t("comments")} icon="💬">

              {/* Existing comments */}
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">
                    {t("noComments")}
                </p>
              ) : (
                <div className="space-y-4 mb-6">
                  {comments.map((c) => (
                    <div
                      key={c._id}
                      className="bg-[#1f1f23] border border-gray-700/60 rounded-xl p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <img
                            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${c.userId?.name || "user"}`}
                            className="w-7 h-7 rounded-full bg-gray-800 p-0.5"
                            alt=""
                          />
                          <span className="text-sm font-medium text-gray-200">
                           {c.userId?.name || t("user")}
                          </span>
                          {c.userId?.role && (
                            <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                              {c.userId.role}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">
                            {new Date(c.createdAt).toLocaleString()}
                          </span>
                          {/* Show delete only if it's the logged-in user's comment */}
                          {(c.userId?._id === user?._id || c.userId === user?._id) && (
                            <button
                              onClick={() => handleDeleteComment(c._id)}
                              className="text-red-500 hover:text-red-400 text-xs"
                            >
                             {t("Delete")}
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{c.content}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add comment */}
              <div className="flex gap-3 mt-2">
                <textarea
                  rows={2}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                   placeholder={t("addComment")}
                  className="flex-1 bg-[#1f1f23] border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#6c584c] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="self-end px-5 py-2 bg-[#6c584c] hover:opacity-90 disabled:opacity-50 rounded-xl text-sm transition"
                >
                  {submittingComment ? t("posting") : t("post")}
                </button>
              </div>
            </Section>

            {/* FEEDBACK SECTION */}
            <Section title={t("feedback")} icon="⭐">

              {feedbackSubmitted && feedback ? (
                /* Already submitted — show read-only */
                <div>
                  <p className="text-sm text-green-400 mb-4 flex items-center gap-2">
                   {t("feedbackSubmitted")}
                  </p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                       {t("yourRating")}
                      </p>
                      <StarRating value={feedback.rating} readonly />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                       {t("markedResolved")}
                      </p>
                      <span
                        className={`text-sm font-semibold ${
                          feedback.resolved ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {feedback.resolved ? "Yes" : "No — Reopened"}
                      </span>
                    </div>
                    {feedback.comments?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                        {t("yourComment")}
                        </p>
                        <p className="text-sm text-gray-300">
                          {feedback.comments[0]}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : grievance?.status === "resolved" ? (
                /* Show feedback form only when resolved */
                <div className="space-y-5">
                  <p className="text-sm text-gray-400">
                   {t("feedbackMessage")}
                  </p>

                  {/* Star rating */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                     {t("rateResolution")}
                    </p>
                    <StarRating
                      value={feedbackForm.rating}
                      onChange={(v) =>
                        setFeedbackForm((p) => ({ ...p, rating: v }))
                      }
                    />
                  </div>

                  {/* Resolved toggle */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    {t("issueResolved")}
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setFeedbackForm((p) => ({ ...p, resolved: true }))
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          feedbackForm.resolved
                            ? "bg-green-500/20 border-green-500/50 text-green-400"
                            : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                      {t("yesResolved")}
                      </button>
                      <button
                        onClick={() =>
                          setFeedbackForm((p) => ({ ...p, resolved: false }))
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                          !feedbackForm.resolved
                            ? "bg-red-500/20 border-red-500/50 text-red-400"
                            : "bg-transparent border-gray-600 text-gray-400 hover:border-gray-500"
                        }`}
                      >
                       {t("noReopen")}
                      </button>
                    </div>
                    {!feedbackForm.resolved && (
                      <p className="text-xs text-red-400 mt-2">
                      {t("reopenWarning")}
                      </p>
                    )}
                  </div>

                  {/* Optional comment */}
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                       {t("additionalComments")}
                    </p>
                    <textarea
                      rows={3}
                      value={feedbackForm.comments}
                      onChange={(e) =>
                        setFeedbackForm((p) => ({
                          ...p,
                          comments: e.target.value,
                        }))
                      }
                      placeholder={t("additionalPlaceholder")}
                      className="w-full bg-[#1f1f23] border border-gray-600 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#6c584c] resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmitFeedback}
                    disabled={submittingFeedback || feedbackForm.rating === 0}
                    className="px-6 py-2.5 bg-[#6c584c] hover:opacity-90 disabled:opacity-50 rounded-xl text-sm font-medium transition"
                  >
                    {submittingFeedback ? t("submitting") : t("submitFeedback")}
                  </button>
                </div>
              ) : (
                /* Not yet resolved */
                <p className="text-gray-500 text-sm">
                  {t("feedbackAvailable")}
                </p>
              )}
            </Section>

          </div>
        )}
      </div>
    </div>
  );
};

export default GrievanceStatus;
