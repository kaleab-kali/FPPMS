import { zodResolver } from "@hookform/resolvers/zod";
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Edit2, FolderOpen, Plus, Trash2 } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import {
	useCreateWeaponCategory,
	useCreateWeaponType,
	useDeleteWeaponCategory,
	useDeleteWeaponType,
	useUpdateWeaponCategory,
	useUpdateWeaponType,
} from "#web/api/weapons/weapons.mutations";
import { useWeaponCategories, useWeaponTypes } from "#web/api/weapons/weapons.queries";
import { Badge } from "#web/components/ui/badge";
import { Button } from "#web/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "#web/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#web/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "#web/components/ui/form";
import { Input } from "#web/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "#web/components/ui/select";
import { Switch } from "#web/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#web/components/ui/table";
import type { WeaponCategory, WeaponType } from "#web/types/weapons";

const categorySchema = z.object({
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().optional(),
	description: z.string().optional(),
	isActive: z.boolean().default(true),
});

const typeSchema = z.object({
	categoryId: z.string().min(1, "Category is required"),
	code: z.string().min(1, "Code is required"),
	name: z.string().min(1, "Name is required"),
	nameAm: z.string().optional(),
	caliber: z.string().min(1, "Caliber is required"),
	manufacturer: z.string().optional(),
	isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;
type TypeFormData = z.infer<typeof typeSchema>;

const categoryColumnHelper = createColumnHelper<WeaponCategory>();
const typeColumnHelper = createColumnHelper<WeaponType>();

const WeaponCategoriesPageComponent = (): React.ReactElement => {
	const { t } = useTranslation(["weapons", "common"]);
	const { i18n } = useTranslation();
	const isAmharic = i18n.language === "am";

	const [showCategoryDialog, setShowCategoryDialog] = React.useState(false);
	const [showTypeDialog, setShowTypeDialog] = React.useState(false);
	const [editingCategory, setEditingCategory] = React.useState<WeaponCategory | null>(null);
	const [editingType, setEditingType] = React.useState<WeaponType | null>(null);

	const { data: categories, refetch: refetchCategories } = useWeaponCategories({});
	const { data: types, refetch: refetchTypes } = useWeaponTypes({});

	const createCategory = useCreateWeaponCategory();
	const updateCategory = useUpdateWeaponCategory();
	const deleteCategory = useDeleteWeaponCategory();
	const createType = useCreateWeaponType();
	const updateType = useUpdateWeaponType();
	const deleteType = useDeleteWeaponType();

	const categoryForm = useForm<CategoryFormData>({
		resolver: zodResolver(categorySchema),
		defaultValues: { code: "", name: "", nameAm: "", description: "", isActive: true },
	});

	const typeForm = useForm<TypeFormData>({
		resolver: zodResolver(typeSchema),
		defaultValues: { categoryId: "", code: "", name: "", nameAm: "", caliber: "", manufacturer: "", isActive: true },
	});

	const handleCategorySubmit = React.useCallback(
		async (data: CategoryFormData) => {
			if (editingCategory) {
				await updateCategory.mutateAsync({ id: editingCategory.id, data });
			} else {
				await createCategory.mutateAsync(data);
			}
			categoryForm.reset();
			setEditingCategory(null);
			setShowCategoryDialog(false);
			refetchCategories();
		},
		[editingCategory, updateCategory, createCategory, categoryForm, refetchCategories],
	);

	const handleTypeSubmit = React.useCallback(
		async (data: TypeFormData) => {
			if (editingType) {
				await updateType.mutateAsync({ id: editingType.id, data });
			} else {
				await createType.mutateAsync(data);
			}
			typeForm.reset();
			setEditingType(null);
			setShowTypeDialog(false);
			refetchTypes();
		},
		[editingType, updateType, createType, typeForm, refetchTypes],
	);

	const handleEditCategory = React.useCallback(
		(category: WeaponCategory) => {
			setEditingCategory(category);
			categoryForm.reset({
				code: category.code,
				name: category.name,
				nameAm: category.nameAm ?? "",
				description: category.description ?? "",
				isActive: category.isActive,
			});
			setShowCategoryDialog(true);
		},
		[categoryForm],
	);

	const handleEditType = React.useCallback(
		(type: WeaponType) => {
			setEditingType(type);
			typeForm.reset({
				categoryId: type.categoryId,
				code: type.code,
				name: type.name,
				nameAm: type.nameAm ?? "",
				caliber: type.caliber,
				manufacturer: type.manufacturer ?? "",
				isActive: type.isActive,
			});
			setShowTypeDialog(true);
		},
		[typeForm],
	);

	const handleDeleteCategory = React.useCallback(
		async (id: string) => {
			await deleteCategory.mutateAsync(id);
			refetchCategories();
		},
		[deleteCategory, refetchCategories],
	);

	const handleDeleteType = React.useCallback(
		async (id: string) => {
			await deleteType.mutateAsync(id);
			refetchTypes();
		},
		[deleteType, refetchTypes],
	);

	const handleCloseCategoryDialog = React.useCallback(() => {
		categoryForm.reset();
		setEditingCategory(null);
		setShowCategoryDialog(false);
	}, [categoryForm]);

	const handleCloseTypeDialog = React.useCallback(() => {
		typeForm.reset();
		setEditingType(null);
		setShowTypeDialog(false);
	}, [typeForm]);

	const categoryColumns = React.useMemo(
		() => [
			categoryColumnHelper.accessor("code", {
				header: () => t("weapons:categoryCode"),
				cell: (info) => <span className="font-mono">{info.getValue()}</span>,
			}),
			categoryColumnHelper.accessor("name", {
				header: () => t("weapons:categoryName"),
				cell: (info) => (isAmharic && info.row.original.nameAm ? info.row.original.nameAm : info.getValue()),
			}),
			categoryColumnHelper.accessor("isActive", {
				header: () => t("common:status"),
				cell: (info) => (
					<Badge variant={info.getValue() ? "default" : "secondary"}>
						{info.getValue() ? t("common:active") : t("common:inactive")}
					</Badge>
				),
			}),
			categoryColumnHelper.display({
				id: "actions",
				header: () => t("common:actions"),
				cell: (info) => (
					<div className="flex gap-1">
						<Button variant="ghost" size="icon" onClick={() => handleEditCategory(info.row.original)}>
							<Edit2 className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" onClick={() => handleDeleteCategory(info.row.original.id)}>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				),
			}),
		],
		[t, isAmharic, handleEditCategory, handleDeleteCategory],
	);

	const typeColumns = React.useMemo(
		() => [
			typeColumnHelper.accessor("code", {
				header: () => t("weapons:categoryCode"),
				cell: (info) => <span className="font-mono">{info.getValue()}</span>,
			}),
			typeColumnHelper.accessor("name", {
				header: () => t("weapons:typeName"),
				cell: (info) => (isAmharic && info.row.original.nameAm ? info.row.original.nameAm : info.getValue()),
			}),
			typeColumnHelper.accessor("caliber", {
				header: () => t("weapons:caliber"),
				cell: (info) => info.getValue(),
			}),
			typeColumnHelper.accessor("categoryName", {
				header: () => t("weapons:category"),
				cell: (info) =>
					isAmharic && info.row.original.categoryNameAm ? info.row.original.categoryNameAm : info.getValue(),
			}),
			typeColumnHelper.accessor("isActive", {
				header: () => t("common:status"),
				cell: (info) => (
					<Badge variant={info.getValue() ? "default" : "secondary"}>
						{info.getValue() ? t("common:active") : t("common:inactive")}
					</Badge>
				),
			}),
			typeColumnHelper.display({
				id: "actions",
				header: () => t("common:actions"),
				cell: (info) => (
					<div className="flex gap-1">
						<Button variant="ghost" size="icon" onClick={() => handleEditType(info.row.original)}>
							<Edit2 className="h-4 w-4" />
						</Button>
						<Button variant="ghost" size="icon" onClick={() => handleDeleteType(info.row.original.id)}>
							<Trash2 className="h-4 w-4" />
						</Button>
					</div>
				),
			}),
		],
		[t, isAmharic, handleEditType, handleDeleteType],
	);

	const categoryTable = useReactTable({
		data: categories ?? [],
		columns: categoryColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	const typeTable = useReactTable({
		data: types ?? [],
		columns: typeColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="container mx-auto py-6 space-y-6">
			<div className="flex items-center gap-3">
				<FolderOpen className="h-8 w-8 text-primary" />
				<div>
					<h1 className="text-2xl font-bold">{t("weapons:categories")}</h1>
					<p className="text-muted-foreground">{t("weapons:categoriesDescription")}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>{t("weapons:categories")}</CardTitle>
						<Button size="sm" onClick={() => setShowCategoryDialog(true)}>
							<Plus className="h-4 w-4 mr-2" />
							{t("weapons:addCategory")}
						</Button>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									{categoryTable.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(header.column.columnDef.header, header.getContext())}
												</TableHead>
											))}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{categoryTable.getRowModel().rows.length > 0 ? (
										categoryTable.getRowModel().rows.map((row) => (
											<TableRow key={row.id}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={categoryColumns.length} className="h-24 text-center">
												{t("weapons:noCategories")}
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="flex flex-row items-center justify-between">
						<CardTitle>{t("weapons:types")}</CardTitle>
						<Button size="sm" onClick={() => setShowTypeDialog(true)}>
							<Plus className="h-4 w-4 mr-2" />
							{t("weapons:addType")}
						</Button>
					</CardHeader>
					<CardContent>
						<div className="rounded-md border">
							<Table>
								<TableHeader>
									{typeTable.getHeaderGroups().map((headerGroup) => (
										<TableRow key={headerGroup.id}>
											{headerGroup.headers.map((header) => (
												<TableHead key={header.id}>
													{header.isPlaceholder
														? null
														: flexRender(header.column.columnDef.header, header.getContext())}
												</TableHead>
											))}
										</TableRow>
									))}
								</TableHeader>
								<TableBody>
									{typeTable.getRowModel().rows.length > 0 ? (
										typeTable.getRowModel().rows.map((row) => (
											<TableRow key={row.id}>
												{row.getVisibleCells().map((cell) => (
													<TableCell key={cell.id}>
														{flexRender(cell.column.columnDef.cell, cell.getContext())}
													</TableCell>
												))}
											</TableRow>
										))
									) : (
										<TableRow>
											<TableCell colSpan={typeColumns.length} className="h-24 text-center">
												{t("weapons:noTypes")}
											</TableCell>
										</TableRow>
									)}
								</TableBody>
							</Table>
						</div>
					</CardContent>
				</Card>
			</div>

			<Dialog open={showCategoryDialog} onOpenChange={handleCloseCategoryDialog}>
				<DialogContent className="sm:max-w-[600px]">
					<DialogHeader>
						<DialogTitle>{editingCategory ? t("weapons:editCategory") : t("weapons:addCategory")}</DialogTitle>
						<DialogDescription>{t("weapons:categoriesDescription")}</DialogDescription>
					</DialogHeader>
					<Form {...categoryForm}>
						<form onSubmit={categoryForm.handleSubmit(handleCategorySubmit)} className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
								<FormField
									control={categoryForm.control}
									name="code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:categoryCode")}</FormLabel>
											<FormControl>
												<Input {...field} placeholder="PISTOL" disabled={!!editingCategory} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={categoryForm.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:categoryName")}</FormLabel>
											<FormControl>
												<Input {...field} placeholder="Pistol" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={categoryForm.control}
									name="nameAm"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:categoryNameAm")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={categoryForm.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<FormLabel className="!mt-0">{t("common:active")}</FormLabel>
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={handleCloseCategoryDialog}>
									{t("common:cancel")}
								</Button>
								<Button type="submit" disabled={createCategory.isPending || updateCategory.isPending}>
									{createCategory.isPending || updateCategory.isPending ? t("common:saving") : t("common:save")}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>

			<Dialog open={showTypeDialog} onOpenChange={handleCloseTypeDialog}>
				<DialogContent className="sm:max-w-[700px]">
					<DialogHeader>
						<DialogTitle>{editingType ? t("weapons:editType") : t("weapons:addType")}</DialogTitle>
						<DialogDescription>{t("weapons:categoriesDescription")}</DialogDescription>
					</DialogHeader>
					<Form {...typeForm}>
						<form onSubmit={typeForm.handleSubmit(handleTypeSubmit)} className="space-y-4">
							<div className="grid grid-cols-3 gap-4">
								<FormField
									control={typeForm.control}
									name="categoryId"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:category")}</FormLabel>
											<Select onValueChange={field.onChange} value={field.value}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder={t("weapons:category")} />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{categories?.map((cat) => (
														<SelectItem key={cat.id} value={cat.id}>
															{isAmharic && cat.nameAm ? cat.nameAm : cat.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={typeForm.control}
									name="code"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:categoryCode")}</FormLabel>
											<FormControl>
												<Input {...field} placeholder="AK47" disabled={!!editingType} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={typeForm.control}
									name="name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:typeName")}</FormLabel>
											<FormControl>
												<Input {...field} placeholder="AK-47" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={typeForm.control}
									name="nameAm"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:typeNameAm")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={typeForm.control}
									name="caliber"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:caliber")}</FormLabel>
											<FormControl>
												<Input {...field} placeholder="7.62x39mm" />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={typeForm.control}
									name="manufacturer"
									render={({ field }) => (
										<FormItem>
											<FormLabel>{t("weapons:manufacturer")}</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={typeForm.control}
								name="isActive"
								render={({ field }) => (
									<FormItem className="flex items-center gap-2">
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
										<FormLabel className="!mt-0">{t("common:active")}</FormLabel>
									</FormItem>
								)}
							/>
							<DialogFooter>
								<Button type="button" variant="outline" onClick={handleCloseTypeDialog}>
									{t("common:cancel")}
								</Button>
								<Button type="submit" disabled={createType.isPending || updateType.isPending}>
									{createType.isPending || updateType.isPending ? t("common:saving") : t("common:save")}
								</Button>
							</DialogFooter>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
};

WeaponCategoriesPageComponent.displayName = "WeaponCategoriesPage";

export const WeaponCategoriesPage = React.memo(WeaponCategoriesPageComponent);
