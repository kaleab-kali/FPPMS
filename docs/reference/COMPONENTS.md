# Components Reference

> Reusable UI components available in PPMS

---

## shadcn/ui Components

**Location:** `packages/web/src/components/ui/`

These are pre-built components from shadcn/ui. Use them directly.

### Form Components

| Component | Import | Usage |
|-----------|--------|-------|
| Button | `#web/components/ui/button` | Primary actions |
| Input | `#web/components/ui/input` | Text input |
| Textarea | `#web/components/ui/textarea` | Multi-line text |
| Select | `#web/components/ui/select` | Dropdown select |
| Checkbox | `#web/components/ui/checkbox` | Boolean toggle |
| Switch | `#web/components/ui/switch` | On/off toggle |
| Radio Group | `#web/components/ui/radio-group` | Single selection |
| Form | `#web/components/ui/form` | Form wrapper with validation |
| Label | `#web/components/ui/label` | Form labels |

### Layout Components

| Component | Import | Usage |
|-----------|--------|-------|
| Card | `#web/components/ui/card` | Content container |
| Tabs | `#web/components/ui/tabs` | Tabbed content |
| Separator | `#web/components/ui/separator` | Visual divider |
| ScrollArea | `#web/components/ui/scroll-area` | Scrollable container |
| Collapsible | `#web/components/ui/collapsible` | Expandable content |
| Sheet | `#web/components/ui/sheet` | Side panel |

### Feedback Components

| Component | Import | Usage |
|-----------|--------|-------|
| Alert | `#web/components/ui/alert` | Alert messages |
| AlertDialog | `#web/components/ui/alert-dialog` | Confirmation dialog |
| Dialog | `#web/components/ui/dialog` | Modal dialog |
| Sonner (Toast) | `#web/components/ui/sonner` | Toast notifications |
| Progress | `#web/components/ui/progress` | Progress bar |
| Skeleton | `#web/components/ui/skeleton` | Loading placeholder |
| Tooltip | `#web/components/ui/tooltip` | Hover tips |

### Navigation Components

| Component | Import | Usage |
|-----------|--------|-------|
| Breadcrumb | `#web/components/ui/breadcrumb` | Page breadcrumbs |
| DropdownMenu | `#web/components/ui/dropdown-menu` | Dropdown menu |
| Command | `#web/components/ui/command` | Command palette |
| Popover | `#web/components/ui/popover` | Floating content |
| Sidebar | `#web/components/ui/sidebar` | App sidebar |

### Data Display

| Component | Import | Usage |
|-----------|--------|-------|
| Table | `#web/components/ui/table` | Data tables |
| Badge | `#web/components/ui/badge` | Status badges |
| Avatar | `#web/components/ui/avatar` | User avatars |

---

## Custom Common Components

**Location:** `packages/web/src/components/common/`

### DataTable

```typescript
import { DataTable } from "#web/components/common/DataTable";

<DataTable
  data={employees}
  columns={columns}
  isLoading={isLoading}
  onRowClick={handleRowClick}
  pagination={{
    page: 1,
    totalPages: 10,
    onPageChange: setPage
  }}
/>
```

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| data | T[] | Yes | Array of data |
| columns | ColumnDef[] | Yes | TanStack Table columns |
| isLoading | boolean | No | Show loading state |
| onRowClick | (row: T) => void | No | Row click handler |
| pagination | object | No | Pagination config |

---

### Pagination

```typescript
import { Pagination } from "#web/components/common/Pagination";

<Pagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

**Props:**
| Prop | Type | Required |
|------|------|----------|
| currentPage | number | Yes |
| totalPages | number | Yes |
| onPageChange | (page: number) => void | Yes |

---

### LoadingSpinner

```typescript
import { LoadingSpinner } from "#web/components/common/LoadingSpinner";

<LoadingSpinner />
<LoadingSpinner size="lg" />
```

**Props:**
| Prop | Type | Default |
|------|------|---------|
| size | "sm" \| "md" \| "lg" | "md" |

---

### ConfirmDialog

```typescript
import { ConfirmDialog } from "#web/components/common/ConfirmDialog";

<ConfirmDialog
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onConfirm={handleDelete}
  title="Delete Employee"
  description="Are you sure you want to delete this employee?"
  confirmText="Delete"
  variant="destructive"
/>
```

**Props:**
| Prop | Type | Required |
|------|------|----------|
| open | boolean | Yes |
| onClose | () => void | Yes |
| onConfirm | () => void | Yes |
| title | string | Yes |
| description | string | No |
| confirmText | string | No |
| variant | "default" \| "destructive" | No |

---

### DateDisplay

```typescript
import { DateDisplay } from "#web/components/common/DateDisplay";

<DateDisplay date="2025-01-18" format="long" />
<DateDisplay date={employee.birthDate} showEthiopian />
```

**Props:**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| date | string \| Date | Yes | Date to display |
| format | "short" \| "long" | "short" | Display format |
| showEthiopian | boolean | false | Show Ethiopian date |

---

### DualCalendarPicker

```typescript
import { DualCalendarPicker } from "#web/components/common/DualCalendarPicker";

<DualCalendarPicker
  value={date}
  onChange={setDate}
  label="Date of Birth"
/>
```

Shows both Gregorian and Ethiopian calendars for date selection.

**Props:**
| Prop | Type | Required |
|------|------|----------|
| value | Date | No |
| onChange | (date: Date) => void | Yes |
| label | string | No |
| disabled | boolean | No |

---

### EmployeeSearch

```typescript
import { EmployeeSearch } from "#web/components/common/EmployeeSearch";

<EmployeeSearch
  value={selectedEmployee}
  onChange={setSelectedEmployee}
  placeholder="Search by Employee ID"
/>
```

**CRITICAL:** ALWAYS use this component for employee selection. NEVER use a dropdown with all employees loaded.

**Props:**
| Prop | Type | Required |
|------|------|----------|
| value | Employee \| null | No |
| onChange | (employee: Employee \| null) => void | Yes |
| placeholder | string | No |
| disabled | boolean | No |

---

### PermissionGate

```typescript
import { PermissionGate } from "#web/components/common/PermissionGate";

<PermissionGate permissions={["employees:write"]}>
  <Button onClick={handleEdit}>Edit</Button>
</PermissionGate>

<PermissionGate permissions={["employees:delete"]} fallback={null}>
  <Button variant="destructive">Delete</Button>
</PermissionGate>
```

Conditionally renders children based on user permissions.

**Props:**
| Prop | Type | Required |
|------|------|----------|
| permissions | string[] | Yes |
| children | ReactNode | Yes |
| fallback | ReactNode | No |
| requireAll | boolean | No |

---

### ComingSoonPage

```typescript
import { ComingSoonPage } from "#web/components/common/ComingSoonPage";

<ComingSoonPage
  title="Reports"
  description="This feature is coming soon."
/>
```

Placeholder for unimplemented features.

---

### AttachmentUploader

```typescript
import { AttachmentUploader } from "#web/components/common/AttachmentUploader";

<AttachmentUploader
  entityType="EMPLOYEE"
  entityId={employee.id}
  onUploadComplete={handleUploadComplete}
  maxFiles={5}
  acceptedTypes={["image/*", ".pdf"]}
/>
```

**Props:**
| Prop | Type | Required |
|------|------|----------|
| entityType | AttachableType | Yes |
| entityId | string | Yes |
| onUploadComplete | () => void | No |
| maxFiles | number | No |
| acceptedTypes | string[] | No |

---

### AttachmentList

```typescript
import { AttachmentList } from "#web/components/common/AttachmentList";

<AttachmentList
  entityType="EMPLOYEE"
  entityId={employee.id}
  canDelete={hasPermission("attachments:delete")}
/>
```

---

### InactivityWarningDialog

```typescript
import { InactivityWarningDialog } from "#web/components/common/InactivityWarningDialog";

// Usually placed in root layout
<InactivityWarningDialog
  open={showWarning}
  onContinue={resetTimer}
  onLogout={handleLogout}
  remainingSeconds={60}
/>
```

---

## Layout Components

**Location:** `packages/web/src/components/layout/`

### AppLayout

Main application layout with sidebar.

```typescript
import { AppLayout } from "#web/components/layout/AppLayout";

<AppLayout>
  <Outlet />
</AppLayout>
```

### AppSidebar

Navigation sidebar with menu items.

```typescript
// Usually used inside AppLayout
// Modify to add new navigation items
```

**To add navigation item:**
Edit `packages/web/src/components/layout/AppSidebar.tsx`

```typescript
{
  title: t("sidebar.newFeature"),
  url: "/new-feature",
  icon: BoxIcon,
}
```

### NavUser

User menu in sidebar showing current user.

---

## Component Patterns

### Form with React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "#web/components/ui/form";
import { Input } from "#web/components/ui/input";
import { Button } from "#web/components/ui/button";

const schema = z.object({
  name: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;

const MyForm = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const onSubmit = (data: FormData) => {
    // handle submit
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};
```

### Table with TanStack Table

```typescript
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "#web/components/common/DataTable";

const columns: ColumnDef<Employee>[] = [
  {
    accessorKey: "employeeId",
    header: "ID",
  },
  {
    accessorKey: "firstName",
    header: "Name",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        {/* actions */}
      </DropdownMenu>
    ),
  },
];

<DataTable data={employees} columns={columns} />
```

### Dialog with Form

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "#web/components/ui/dialog";

const FormDialog = ({ open, onClose, entity }) => {
  // Form setup...

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entity ? "Edit" : "Create"}</DialogTitle>
        </DialogHeader>
        {/* Form content */}
      </DialogContent>
    </Dialog>
  );
};
```

---

## Adding New shadcn Components

```bash
cd packages/web
npx shadcn@latest add [component-name]
```

Available components: https://ui.shadcn.com/docs/components

---

## Related Documentation

- [AI-MODULE-GUIDE.md](../guides/AI-MODULE-GUIDE.md) - Using components in features
- [UTILITIES.md](./UTILITIES.md) - Utility functions
- [FILE-MAP.md](../codebase/FILE-MAP.md) - Find component files

---

*Last Updated: 2025-01-18*
