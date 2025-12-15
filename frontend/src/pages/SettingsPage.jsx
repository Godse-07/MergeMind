import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import {
  Plus,
  Settings,
  Save,
  Trash2,
  Sparkles,
  GripVertical,
} from "lucide-react";
import toast from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { addCustomRules, getCustomRules } from "../lib/api";

const AI_SUGGESTIONS = [
  "Ensure all new functions include unit tests",
  "Reject PRs with console.log statements",
  "Check for proper error handling in async functions",
  "Ensure new APIs are documented",
];

const SettingsPage = () => {
  const [rules, setRules] = useState([{ id: crypto.randomUUID(), text: "" }]);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await getCustomRules();
        console.log("GET RULES RESPONSE:", res);

        if (res?.data?.length > 0) {
          setRules(
            res.data.map((rule) => ({
              id: crypto.randomUUID(),
              text: rule,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load rules");
      }
    };

    fetchRules();
  }, []);

  const handleChange = (index, value) => {
    const updated = [...rules];
    updated[index].text = value;
    setRules(updated);
  };

  const addRule = () => {
    setRules([...rules, { id: crypto.randomUUID(), text: "" }]);
  };

  const deleteRule = (index) => {
    const updated = rules.filter((_, i) => i !== index);
    setRules(
      updated.length ? updated : [{ id: crypto.randomUUID(), text: "" }]
    );
  };

  const addSuggestion = (text) => {
    setRules([...rules, { id: crypto.randomUUID(), text }]);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(rules);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    setRules(items);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emptyIndexes = rules
      .map((r, i) => (!r.text.trim() ? i : null))
      .filter((i) => i !== null);

    if (emptyIndexes.length > 0) {
      const touchedMap = {};
      emptyIndexes.forEach((i) => (touchedMap[i] = true));
      setTouched(touchedMap);

      toast.error("Please fill or remove empty rules before saving");
      return;
    }

    try {
      setSaving(true);
      await addCustomRules(rules.map((r) => r.text));
      toast.success("Rules saved successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save rules");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Navbar />

      <div className="pt-24 max-w-4xl mx-auto px-4 pb-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Custom PR Analysis Rules
          </h1>
          <p className="text-gray-600">
            Customize how pull requests are analyzed by defining rules below.
          </p>
        </div>

        {/* Rules Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold">Analysis Rules</h2>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="rules">
              {(provided) => (
                <form
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {rules.map((rule, index) => (
                    <Draggable
                      key={rule.id}
                      draggableId={rule.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="relative"
                        >
                          {/* Drag Handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="absolute left-3 top-3 cursor-grab text-gray-400 hover:text-gray-600"
                          >
                            <GripVertical size={16} />
                          </div>

                          <textarea
                            rows={3}
                            value={rule.text}
                            onChange={(e) =>
                              handleChange(index, e.target.value)
                            }
                            placeholder="e.g. Ensure new features include unit tests"
                            className={`w-full rounded-lg pl-10 pr-4 py-3 text-sm resize-none focus:ring-2
                              ${
                                touched[index] && !rule.text.trim()
                                  ? "border-red-400 focus:ring-red-400"
                                  : "border-gray-300 focus:ring-blue-500"
                              }
                            `}
                          />

                          {/* Actions */}
                          <div className="absolute right-3 top-3 flex gap-2">
                            {index === rules.length - 1 && (
                              <button
                                type="button"
                                onClick={addRule}
                                className="text-gray-400 hover:text-blue-600"
                              >
                                <Plus size={16} />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => deleteRule(index)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}

                  {/* Save */}
                  <div className="pt-6 flex items-center gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      <Save size={16} />
                      {saving ? "Saving..." : "Save Rules"}
                    </button>
                  </div>
                </form>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* AI Suggestions */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">AI Suggested Rules</h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {AI_SUGGESTIONS.map((rule, i) => (
              <button
                key={i}
                onClick={() => addSuggestion(rule)}
                className="text-left text-sm border border-gray-200 rounded-lg px-4 py-3 hover:bg-gray-50 transition"
              >
                {rule}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
