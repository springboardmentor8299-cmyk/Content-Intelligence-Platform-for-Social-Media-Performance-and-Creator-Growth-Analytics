import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <Navbar />

      <main className="min-h-screen pt-20 lg:ml-64">
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;