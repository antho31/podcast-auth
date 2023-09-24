export type Verification = {
	RssFeed: string;
	AdminAddress: string;
	Code: string;
	Epoch: number;
	Validated: number;
};

export function checkVerificationCode(
	db: D1Database,
	rssFeed: string,
	adminAddress: string,
	code: string,
	limitMs: number,
): Promise<D1Result<Verification>> {
	return db
		.prepare('SELECT * FROM Verifications WHERE RssFeed = ? AND AdminAddress = ? AND Code = ? AND Epoch + ? > ?;')
		.bind(rssFeed, adminAddress.toUpperCase(), code, limitMs, new Date().valueOf())
		.all();
}

export function getAllVerifications(db: D1Database): Promise<D1Result<Verification>> {
	return db.prepare('SELECT * FROM Verifications;').all();
}

export function getValidedForAdmin(db: D1Database, adminAddress: string): Promise<D1Result<Verification>> {
	return db.prepare('SELECT * FROM Verifications WHERE Validated = 1 AND AdminAddress = ? ;').bind(adminAddress.toUpperCase()).all();
}

export function storeVerificationCode(
	db: D1Database,
	rssFeed: string,
	adminAddress: string,
	randomCode: string | number,
): Promise<D1Result<Record<string, unknown>>> {
	return db
		.prepare('INSERT INTO Verifications (RssFeed, AdminAddress, Code, Epoch, Validated) VALUES (?,?,?,?,?);')
		.bind(rssFeed, adminAddress.toUpperCase(), randomCode.toString(), new Date().valueOf(), 0)
		.all();
}

export function validateOwnership(
	db: D1Database,
	rssFeed: string,
	adminAddress: string,
	code: string,
): Promise<D1Result<Record<string, unknown>>> {
	return db
		.prepare('UPDATE Verifications SET Validated = 1 WHERE RssFeed = ? AND AdminAddress = ? AND Code = ?')
		.bind(rssFeed, adminAddress.toUpperCase(), code)
		.all();
}
