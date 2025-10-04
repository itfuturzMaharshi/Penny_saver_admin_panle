import CategoriesTable from "../../components/categories/CategoriesTable";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const Categories = () => {
  return (
    <>
      <PageBreadcrumb pageTitle="Categories" />
      <div className="space-y-6">
        <CategoriesTable />
      </div>
    </>
  );
};

export default Categories;