import AdminSidebar from "./AdminSidebar";

import styles from "./AdminLayout.module.css";

export default function AdminLayout({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div
      className={
        styles.adminShell
      }
    >
      <AdminSidebar />

      <main
        className={
          styles.content
        }
      >
        {children}
      </main>
    </div>
  );
}