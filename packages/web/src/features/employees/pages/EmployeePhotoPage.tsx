import { Camera, Upload } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useUploadPhoto } from "#web/api/employees/employee-photo.mutations.ts";
import { EmployeeSearch } from "#web/components/common/EmployeeSearch.tsx";
import { Button } from "#web/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#web/components/ui/card.tsx";
import { Input } from "#web/components/ui/input.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "#web/components/ui/tabs.tsx";
import type { Employee } from "#web/types/employee.ts";

export const EmployeePhotoPage = React.memo(() => {
	const { t } = useTranslation("employees");
	const { t: tCommon } = useTranslation("common");

	const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);
	const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
	const [isWebcamActive, setIsWebcamActive] = React.useState(false);
	const [uploadedFile, setUploadedFile] = React.useState<File | null>(null);
	const [uploadPreview, setUploadPreview] = React.useState<string | null>(null);
	const [captureMode, setCaptureMode] = React.useState<"webcam" | "upload">("webcam");

	const videoRef = React.useRef<HTMLVideoElement>(null);
	const canvasRef = React.useRef<HTMLCanvasElement>(null);
	const streamRef = React.useRef<MediaStream | null>(null);
	const fileInputRef = React.useRef<HTMLInputElement>(null);

	const uploadMutation = useUploadPhoto();

	const startWebcam = React.useCallback(async () => {
		const constraints = {
			video: {
				width: { ideal: 640 },
				height: { ideal: 480 },
				facingMode: "user",
			},
		};

		const stream = await navigator.mediaDevices.getUserMedia(constraints);
		streamRef.current = stream;

		if (videoRef.current) {
			videoRef.current.srcObject = stream;
			await videoRef.current.play();
		}
		setIsWebcamActive(true);
	}, []);

	const stopWebcam = React.useCallback(() => {
		if (streamRef.current) {
			for (const track of streamRef.current.getTracks()) {
				track.stop();
			}
			streamRef.current = null;
		}
		if (videoRef.current) {
			videoRef.current.srcObject = null;
		}
		setIsWebcamActive(false);
	}, []);

	const capturePhoto = React.useCallback(() => {
		if (!videoRef.current || !canvasRef.current) return;

		const video = videoRef.current;
		const canvas = canvasRef.current;
		const ctx = canvas.getContext("2d");

		if (!ctx) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		ctx.drawImage(video, 0, 0);

		const imageData = canvas.toDataURL("image/jpeg", 0.9);
		setCapturedImage(imageData);
		stopWebcam();
	}, [stopWebcam]);

	const handleRetake = React.useCallback(() => {
		setCapturedImage(null);
		startWebcam();
	}, [startWebcam]);

	const handleEmployeeFound = React.useCallback((employee: Employee) => {
		setSelectedEmployee(employee);
	}, []);

	const handleEmployeeClear = React.useCallback(() => {
		setSelectedEmployee(null);
		setCapturedImage(null);
		setUploadedFile(null);
		setUploadPreview(null);
		stopWebcam();
	}, [stopWebcam]);

	const handleFileChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploadedFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setUploadPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	}, []);

	const handleUploadClick = React.useCallback(() => {
		fileInputRef.current?.click();
	}, []);

	const handleClearUpload = React.useCallback(() => {
		setUploadedFile(null);
		setUploadPreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	}, []);

	const dataURLtoFile = React.useCallback((dataurl: string, filename: string): File => {
		const arr = dataurl.split(",");
		const mimeMatch = arr[0].match(/:(.*?);/);
		const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
		const bstr = atob(arr[1]);
		let n = bstr.length;
		const u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	}, []);

	const handleSaveWebcam = React.useCallback(async () => {
		if (!selectedEmployee || !capturedImage) {
			toast.error(tCommon("fillRequired"));
			return;
		}

		const file = dataURLtoFile(capturedImage, `photo_${selectedEmployee.employeeId}_${Date.now()}.jpg`);

		uploadMutation.mutate(
			{
				data: {
					employeeId: selectedEmployee.id,
					captureMethod: "WEBCAM",
				},
				file,
			},
			{
				onSuccess: () => {
					toast.success(tCommon("success"));
					setCapturedImage(null);
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			},
		);
	}, [selectedEmployee, capturedImage, uploadMutation, tCommon, dataURLtoFile]);

	const handleSaveUpload = React.useCallback(() => {
		if (!selectedEmployee || !uploadedFile) {
			toast.error(tCommon("fillRequired"));
			return;
		}

		uploadMutation.mutate(
			{
				data: {
					employeeId: selectedEmployee.id,
					captureMethod: "UPLOAD",
				},
				file: uploadedFile,
			},
			{
				onSuccess: () => {
					toast.success(tCommon("success"));
					setUploadedFile(null);
					setUploadPreview(null);
					if (fileInputRef.current) {
						fileInputRef.current.value = "";
					}
				},
				onError: () => {
					toast.error(tCommon("error"));
				},
			},
		);
	}, [selectedEmployee, uploadedFile, uploadMutation, tCommon]);

	const handleTabChange = React.useCallback(
		(value: string) => {
			setCaptureMode(value as "webcam" | "upload");
			stopWebcam();
			setCapturedImage(null);
			setUploadedFile(null);
			setUploadPreview(null);
		},
		[stopWebcam],
	);

	React.useEffect(() => {
		return () => {
			stopWebcam();
		};
	}, [stopWebcam]);

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold">{t("photo.title")}</h1>
					<p className="text-muted-foreground">{t("photo.subtitle")}</p>
				</div>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>{tCommon("search")}</CardTitle>
					<CardDescription>{t("photo.subtitle")}</CardDescription>
				</CardHeader>
				<CardContent>
					<EmployeeSearch
						onEmployeeFound={handleEmployeeFound}
						onClear={handleEmployeeClear}
						selectedEmployee={selectedEmployee}
					/>
				</CardContent>
			</Card>

			{selectedEmployee && (
				<Card>
					<CardHeader>
						<CardTitle>{t("photo.capturePhoto")}</CardTitle>
						<CardDescription>
							{selectedEmployee.fullName} ({selectedEmployee.employeeId})
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Tabs value={captureMode} onValueChange={handleTabChange}>
							<TabsList className="grid w-full grid-cols-2 mb-4">
								<TabsTrigger value="webcam">
									<Camera className="mr-2 h-4 w-4" />
									{t("photo.webcam")}
								</TabsTrigger>
								<TabsTrigger value="upload">
									<Upload className="mr-2 h-4 w-4" />
									{t("photo.uploadFile")}
								</TabsTrigger>
							</TabsList>

							<TabsContent value="webcam">
								<div className="space-y-4">
									<div className="relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-lg border bg-black">
										{!capturedImage && (
											<video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted />
										)}
										{capturedImage && <img src={capturedImage} alt="Captured" className="h-full w-full object-cover" />}
										{!isWebcamActive && !capturedImage && (
											<div className="absolute inset-0 flex items-center justify-center">
												<Button onClick={startWebcam} variant="secondary" size="lg">
													<Camera className="mr-2 h-5 w-5" />
													{t("photo.startCamera")}
												</Button>
											</div>
										)}
									</div>
									<canvas ref={canvasRef} className="hidden" />

									<div className="flex justify-center gap-4">
										{isWebcamActive && !capturedImage && (
											<Button onClick={capturePhoto} size="lg">
												<Camera className="mr-2 h-5 w-5" />
												{t("photo.capture")}
											</Button>
										)}
										{capturedImage && (
											<>
												<Button onClick={handleRetake} variant="outline" size="lg">
													{t("photo.retake")}
												</Button>
												<Button onClick={handleSaveWebcam} size="lg" disabled={uploadMutation.isPending}>
													{uploadMutation.isPending ? tCommon("saving") : tCommon("save")}
												</Button>
											</>
										)}
									</div>
								</div>
							</TabsContent>

							<TabsContent value="upload">
								<div className="space-y-4">
									<Input
										ref={fileInputRef}
										type="file"
										accept="image/*"
										onChange={handleFileChange}
										className="hidden"
									/>

									{!uploadPreview && (
										<div
											onClick={handleUploadClick}
											onKeyDown={(e) => e.key === "Enter" && handleUploadClick()}
											role="button"
											tabIndex={0}
											className="aspect-video w-full max-w-2xl mx-auto rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
										>
											<Upload className="h-12 w-12 text-muted-foreground mb-4" />
											<p className="text-muted-foreground text-center">{t("photo.clickToUpload")}</p>
											<p className="text-sm text-muted-foreground/70 mt-1">JPG, PNG, GIF</p>
										</div>
									)}

									{uploadPreview && (
										<div className="relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-lg border bg-muted">
											<img src={uploadPreview} alt="Preview" className="h-full w-full object-cover" />
										</div>
									)}

									<div className="flex justify-center gap-4">
										{uploadPreview && (
											<>
												<Button onClick={handleClearUpload} variant="outline" size="lg">
													{tCommon("clear")}
												</Button>
												<Button onClick={handleSaveUpload} size="lg" disabled={uploadMutation.isPending}>
													{uploadMutation.isPending ? tCommon("saving") : tCommon("save")}
												</Button>
											</>
										)}
									</div>
								</div>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>
			)}
		</div>
	);
});

EmployeePhotoPage.displayName = "EmployeePhotoPage";
