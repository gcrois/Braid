import { useCoreContext } from "./coreContext";

export function CoreManager() {
	const { cores } = useCoreContext();

	return (
		<div className="bg-[var(--color-base02)] rounded-lg p-4 mb-4 shadow-md border border-[var(--color-base01)] border-opacity-30">
			<h2 className="mb-4 text-[var(--typography-headings)]">Core Manager</h2>
			<table className="w-full border-collapse">
				<thead>
					<tr className="border-b border-[var(--color-base01)] border-opacity-30">
						<th className="py-2 px-4 text-left font-semibold text-[var(--typography-headings)]">Core Name</th>
						<th className="py-2 px-4 text-left font-semibold text-[var(--typography-headings)]">Status</th>
						<th className="py-2 px-4 text-left font-semibold text-[var(--typography-headings)]">Worker</th>
						<th className="py-2 px-4 text-left font-semibold text-[var(--typography-headings)]">Details</th>
						<th className="py-2 px-4 text-left font-semibold text-[var(--typography-headings)]">Actions</th>
					</tr>
				</thead>
				<tbody>
					{cores.map((core) => {
						const info = { sourceFiles: [], availableMethods: [] };
						return (
							<tr key={core.name} className="border-b border-[var(--color-base01)] border-opacity-10">
								<td className="py-2 px-4">{core.name}</td>
								<td className="py-2 px-4">
									<span className={core.module ? "text-[var(--color-green)]" : "text-[var(--color-base00)]"}>
										{core.module ? "Loaded" : "Not Loaded"}
									</span>
								</td>
								<td className="py-2 px-4">
									<input
										type="checkbox"
										checked={core.loadInWorker}
										onChange={(e) =>
											core.setLoadInWorker(
												e.currentTarget.checked,
											)
										}
										className="w-4 h-4 accent-[var(--color-blue)]"
									/>
								</td>
								<td className="py-2 px-4">
									{core.module ? (
										<>
											<pre className="bg-[var(--color-base01)] bg-opacity-10 p-2 rounded text-xs overflow-auto max-h-24">
												{JSON.stringify(
													Object.keys(core.module),
													null,
													2,
												)}
											</pre>
											<div className="mt-2 text-sm">
												<strong className="text-[var(--typography-headings)]">Source Files:</strong>{" "}
												{info.sourceFiles.join(", ") || "None"}{" "}
												<br />
												<strong className="text-[var(--typography-headings)]">
													Available Methods:
												</strong>{" "}
												{info.availableMethods.join(", ") || "None"}
											</div>
										</>
									) : (
										"—"
									)}
								</td>
								<td className="py-2 px-4">
									{core.module ? (
										<button
											className="cursor-pointer bg-[var(--color-red)] text-[var(--color-base3)] border-none rounded py-1 px-3 transition-colors duration-300 hover:bg-[var(--typography-links-hover)]"
											onClick={core.unload}
										>
											Unload
										</button>
									) : (
										<button
											className="cursor-pointer bg-[var(--color-blue)] text-[var(--color-base3)] border-none rounded py-1 px-3 transition-colors duration-300 hover:bg-[var(--typography-links)]"
											onClick={core.load}
										>
											Load
										</button>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}
