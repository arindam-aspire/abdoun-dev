import { ManageListingComponent } from "@/features/listings/components/ManageListingComponent";

export default function AdminListingsRoute() {
  return <ManageListingComponent subtitle="Review agent-submitted property drafts, request changes, or approve them." addPropertyHref="/admin-dashboard/add-property" userType="admin" />;
}

