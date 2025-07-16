import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const [phone, setPhone] = useState("");
  const [results, setResults] = useState<any[]>([]);

  const search = async () => {
    if (!phone) return;
    const { data, error } = await supabase
      .from("consent_logs")
      .select("*")
      .eq("hashed_phone", phone);
    if (error) alert(error.message);
    else setResults(data as any[]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-4">Consent Logs</h1>
      <input
        className="border p-2 rounded w-64"
        placeholder="Hashed Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={search}
      >
        Search
      </button>
      <pre className="mt-4 w-full max-w-2xl bg-gray-100 p-4 rounded">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}
