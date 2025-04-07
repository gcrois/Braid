import { useCoreContext } from "./coreContext";

export function CoreManager() {
	const { cores } = useCoreContext();

	return (
		<div className="core-manager card">
			<h2>Core Manager</h2>
			<table className="core-table">
				<thead>
					<tr>
						<th>Core Name</th>
						<th>Status</th>
						<th>Worker</th>
						<th>Details</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{cores.map((core) => {
						const info = { sourceFiles: [], availableMethods: [] };
						return (
							<tr key={core.name}>
								<td>{core.name}</td>
								<td>{core.module ? "Loaded" : "Not Loaded"}</td>
								<td>
									<input
										type="checkbox"
										checked={core.loadInWorker}
										onChange={(e) =>
											core.setLoadInWorker(
												e.currentTarget.checked,
											)
										}
									/>
								</td>
								<td>
									{core.module ? (
										<>
											<pre className="core-details">
												{JSON.stringify(
													Object.keys(core.module),
													null,
													2,
												)}
											</pre>
											<div className="core-extra-info">
												<strong>Source Files:</strong>{" "}
												{info.sourceFiles.join(", ")}{" "}
												<br />
												<strong>
													Available Methods:
												</strong>{" "}
												{info.availableMethods.join(
													", ",
												)}
											</div>
										</>
									) : (
										"—"
									)}
								</td>
								<td>
									{core.module ? (
										<button
											className="btn unload"
											onClick={core.unload}
										>
											Unload
										</button>
									) : (
										<button
											className="btn load"
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
