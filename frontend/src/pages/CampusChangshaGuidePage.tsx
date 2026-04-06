import { useState, type ReactNode } from 'react';

type TabId = 'campus' | 'travel';

const TABS: { id: TabId; label: string; sub: string }[] = [
  { id: 'campus', label: 'CSU Campus', sub: 'Libraries, dorms & daily life' },
  { id: 'travel', label: 'Changsha', sub: 'Sights, food & transport' },
];

export default function CampusChangshaGuidePage() {
  const [tab, setTab] = useState<TabId>('campus');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Campus & Changsha Guides</h1>
        <p className="text-sm text-gray-500 mt-2">
          Practical tips for life at Central South University (中南大学) and exploring Changsha. Pair this page with
          the <span className="font-medium text-indigo-600">CSU &amp; Changsha</span> quiz category to learn the
          vocabulary.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-left border-2 transition cursor-pointer min-w-[140px] ${
              tab === t.id
                ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <span className="block text-sm font-semibold">{t.label}</span>
            <span className="block text-xs opacity-80 mt-0.5">{t.sub}</span>
          </button>
        ))}
      </div>

      {tab === 'campus' && <CampusSection />}
      {tab === 'travel' && <TravelSection />}
    </div>
  );
}

function CampusSection() {
  return (
    <div className="space-y-4">
      <GuideCard title="Welcome to CSU & DIICSU">
        <p>
          Central South University (中南大学, CSU) is a comprehensive university in Changsha. DIICSU students study in
          programmes linked with the University of Dundee—check the official{' '}
          <a
            href="https://dii.csu.edu.cn"
            target="_blank"
            rel="noreferrer noopener"
            className="text-indigo-600 hover:underline font-medium"
          >
            Student Life
          </a>{' '}
          portal for the latest notices, events, and support.
        </p>
      </GuideCard>

      <GuideCard title="Campus facilities (English you will use)">
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>Library</strong> (图书馆) — Quiet study floors, book loans, and often exam-season extended hours.
            Bring your student card.
          </li>
          <li>
            <strong>Cafeteria / canteen</strong> (食堂) — Affordable meals; peak times are busy right after class.
          </li>
          <li>
            <strong>Dormitory</strong> (宿舍) — Follow residence rules for visitors, electricity, and quiet hours.
          </li>
          <li>
            <strong>Laboratory</strong> (实验室) — Wear required safety gear; sign in when your course requires it.
          </li>
          <li>
            <strong>Lecture hall</strong> (阶梯教室) — Arrive a few minutes early for large classes.
          </li>
          <li>
            <strong>Teaching building</strong> (教学楼) — Check room numbers on your timetable; buildings can be large.
          </li>
          <li>
            <strong>Gymnasium / playground</strong> — Great for stress relief between assignments.
          </li>
        </ul>
      </GuideCard>

      <GuideCard title="University life vocabulary in practice">
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>Semester</strong> — Plan <strong>credits</strong> and <strong>elective</strong> vs{' '}
            <strong>compulsory</strong> courses early.
          </li>
          <li>
            Watch deadlines for <strong>enrollment</strong>, <strong>assignment</strong> submission, and{' '}
            <strong>exam</strong> registration.
          </li>
          <li>
            Ask your advisor about <strong>scholarship</strong> options and <strong>GPA</strong> requirements.
          </li>
          <li>
            <strong>Freshman</strong> <strong>orientation</strong> sessions are the fastest way to learn campus routes
            and online systems.
          </li>
        </ul>
      </GuideCard>
    </div>
  );
}

function TravelSection() {
  return (
    <div className="space-y-4">
      <GuideCard title="Must-see spots">
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>Orange Island</strong> (橘子洲) — Riverside park; famous statue and river views. Good for a walk and
            photos.
          </li>
          <li>
            <strong>Yuelu Academy</strong> (岳麓书院) — Historic academy at the foot of <strong>Yuelu Mountain</strong>{' '}
            (岳麓山). Allow time to explore slowly.
          </li>
          <li>
            <strong>Xiang River</strong> (湘江) — Defines much of the cityscape; evening lights along the banks are
            popular.
          </li>
          <li>
            <strong>Taiping Street</strong> (太平街) — Busy pedestrian lane for snacks and souvenirs (expect crowds on
            weekends).
          </li>
        </ul>
      </GuideCard>

      <GuideCard title="Food & flavor">
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>Hunan cuisine</strong> (湘菜) — Often <strong>spicy</strong>; say &quot;less spicy&quot; if you need
            a milder dish.
          </li>
          <li>
            <strong>Stinky tofu</strong> (臭豆腐) — A Changsha classic; the smell is stronger than the taste for many
            people.
          </li>
          <li>
            <strong>Rice noodles</strong> (米粉) — A common breakfast; many small shops near campuses.
          </li>
          <li>
            <strong>Hot pot</strong> (火锅) — Fun for groups; book ahead on Friday evenings.
          </li>
          <li>
            <strong>Red braised pork</strong> (红烧肉) — A famous comfort dish; good entry point if you are new to local
            flavors.
          </li>
        </ul>
      </GuideCard>

      <GuideCard title="Getting around">
        <ul className="list-disc pl-5 space-y-2 text-gray-700">
          <li>
            <strong>Changsha subway</strong> (长沙地铁) — Cheap and reliable; download a metro map app or save a
            screenshot offline.
          </li>
          <li>
            <strong>High-speed rail</strong> (高铁) — Changsha connects well to other cities for weekend trips—book
            tickets early on holidays.
          </li>
          <li>
            <strong>Window of the World</strong> (世界之窗) — Theme park area; combine with a free day and good
            weather.
          </li>
        </ul>
      </GuideCard>

      <GuideCard title="Day-trip ideas">
        <p className="text-gray-700">
          Half day: Yuelu Mountain + Yuelu Academy + riverside sunset. Evening: snack street and metro back to campus.
          Always carry your student card, mobile payment, and a bottle of water—Changsha summers are humid.
        </p>
      </GuideCard>
    </div>
  );
}

function GuideCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="part-box p-5 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2 mb-3">{title}</h2>
      <div className="text-sm text-slate-700 leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
