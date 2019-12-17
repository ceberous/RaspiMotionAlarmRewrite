export class EasternTimeKeySuffix {
	constructor() {}
	public now(): string {
		const now = new Date( new Date().toLocaleString( "en-US" , { timeZone: "America/New_York" } ) );
		const now_hours = now.getHours();
		const now_minutes = now.getMinutes();
		const dd = String( now.getDate() ).padStart( 2 , '0' );
		const mm = String( now.getMonth() + 1 ).padStart( 2 , '0' );
		const yyyy = now.getFullYear();
		const hours = String( now.getHours() ).padStart( 2 , '0' );
		const minutes = String( now.getMinutes() ).padStart( 2 , '0' );
		const seconds = String( now.getSeconds() ).padStart( 2 , '0' );
		const key_suffix = `${ yyyy }.${ mm }.${ dd }`;
		return key_suffix;
	}
}