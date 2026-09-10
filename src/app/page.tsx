"use client";

import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";

type Contact = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
};

export default function Home() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  async function fetchContacts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setErrorMessage("ไม่สามารถโหลดข้อมูลได้: " + error.message);
    } else {
      setErrorMessage("");
      setContacts(data ?? []);
    }
    setLoading(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName || !trimmedPhone) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("contacts")
      .insert({ name: trimmedName, phone: trimmedPhone })
      .select()
      .single();

    if (error) {
      setErrorMessage("บันทึกไม่สำเร็จ: " + error.message);
    } else {
      setErrorMessage("");
      setContacts((prev) => [data, ...prev]);
      setName("");
      setPhone("");
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const previousContacts = contacts;
    setContacts((prev) => prev.filter((c) => c.id !== id));

    const { error } = await supabase.from("contacts").delete().eq("id", id);

    if (error) {
      setErrorMessage("ลบไม่สำเร็จ: " + error.message);
      setContacts(previousContacts);
    } else {
      setErrorMessage("");
    }
  }

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-4 py-12 dark:bg-black sm:px-6">
      <main className="w-full max-w-2xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            ระบบบันทึกข้อมูลผู้ติดต่อ V.2
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            เพิ่ม แก้ไข และจัดการรายชื่อผู้ติดต่อของคุณ
          </p>
        </header>

        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                ชื่อ
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-700"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
              >
                เบอร์โทร
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="เช่น 081-234-5678"
                className="w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:ring-zinc-700"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 w-full rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-green-600 dark:hover:bg-green-500 sm:w-auto"
          >
            {saving ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </form>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              รายชื่อที่บันทึกไว้
            </h2>
            <span className="text-sm text-zinc-500 dark:text-zinc-400">
              ทั้งหมด {contacts.length} รายการ
            </span>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            {loading ? (
              <p className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                กำลังโหลดข้อมูล...
              </p>
            ) : contacts.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
                ยังไม่มีรายชื่อที่บันทึกไว้
              </p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    <th className="px-6 py-3 font-medium">ชื่อ</th>
                    <th className="px-6 py-3 font-medium">เบอร์โทร</th>
                    <th className="px-6 py-3 font-medium text-right">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-zinc-100 last:border-0 dark:border-zinc-800/60"
                    >
                      <td className="px-6 py-3 text-zinc-900 dark:text-zinc-50">
                        {contact.name}
                      </td>
                      <td className="px-6 py-3 text-zinc-600 dark:text-zinc-400">
                        {contact.phone}
                      </td>
                      <td className="px-6 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(contact.id)}
                          className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
