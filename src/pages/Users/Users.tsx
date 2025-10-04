import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import UsersTable from "../../components/users/UsersTable";

const Users = () => {
  return (
    <>
      <PageMeta
        title="React.js Users Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Users Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="Users" />
      <div className="space-y-6">
        <UsersTable />
      </div>
    </>
  );
};

export default Users;