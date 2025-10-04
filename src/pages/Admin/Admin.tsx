import AdminsTable from "../../components/admins/AdminsTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const Admin = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Admins" />
      <div className="space-y-6">
        <AdminsTable />
      </div>
    </>
  );
};

export default Admin;