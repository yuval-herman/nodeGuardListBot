/// <reference types="node" />

type APIResult = {
	ok: boolean
	result: any
}

type ChatType = "private" | "group" | "supergroup" | "channel"

type ChatAction =
	| "typing"
	| "upload_photo"
	| "record_video"
	| "upload_video"
	| "record_voice"
	| "upload_voice"
	| "upload_document"
	| "find_location"
	| "record_video_note"
	| "upload_video_note"

type ChatMemberStatus =
	| "creator"
	| "administrator"
	| "member"
	| "restricted"
	| "left"
	| "kicked"

type DocumentMimeType = "application/pdf" | "application/zip"

type MessageType =
	| "text"
	| "animation"
	| "audio"
	| "channel_chat_created"
	| "contact"
	| "delete_chat_photo"
	| "document"
	| "game"
	| "group_chat_created"
	| "invoice"
	| "left_chat_member"
	| "location"
	| "migrate_from_chat_id"
	| "migrate_to_chat_id"
	| "new_chat_members"
	| "new_chat_photo"
	| "new_chat_title"
	| "passport_data"
	| "photo"
	| "pinned_message"
	| "sticker"
	| "successful_payment"
	| "supergroup_chat_created"
	| "video"
	| "video_note"
	| "voice"
	| "video_chat_started"
	| "video_chat_ended"
	| "video_chat_participants_invited"
	| "video_chat_scheduled"
	| "message_auto_delete_timer_changed"
	| "chat_invite_link"
	| "chat_member_updated"
	| "web_app_data"

type MessageEntityType =
	| "mention"
	| "hashtag"
	| "cashtag"
	| "bot_command"
	| "url"
	| "email"
	| "phone_number"
	| "bold"
	| "italic"
	| "underline"
	| "strikethrough"
	| "code"
	| "pre"
	| "text_link"
	| "text_mention"
	| "spoiler"
	| "custom_emoji"

type ParseMode = "Markdown" | "MarkdownV2" | "HTML"

/// METHODS OPTIONS ///
interface PollingOptions {
	interval?: string | number | undefined
	autoStart?: boolean | undefined
	params?: GetUpdatesOptions | undefined
}

interface WebHookOptions {
	host?: string | undefined
	port?: number | undefined
	key?: string | undefined
	cert?: string | undefined
	pfx?: string | undefined
	autoOpen?: boolean | undefined
	https?: ServerOptions | undefined
	healthEndpoint?: string | undefined
}

interface ConstructorOptions {
	polling?: boolean | PollingOptions | undefined
	webHook?: boolean | WebHookOptions | undefined
	onlyFirstMatch?: boolean | undefined
	request?: Options | undefined
	baseApiUrl?: string | undefined
	filepath?: boolean | undefined
}

interface StartPollingOptions extends ConstructorOptions {
	restart?: boolean | undefined
}

interface StopPollingOptions {
	cancel?: boolean | undefined
	reason?: string | undefined
}

interface SetWebHookOptions {
	url?: string | undefined
	certificate?: string | Stream | undefined
	max_connections?: number | undefined
	allowed_updates?: string[] | undefined
}

interface GetUpdatesOptions {
	offset?: number | undefined
	limit?: number | undefined
	timeout?: number | undefined
	allowed_updates?: string[] | undefined
}

interface SendBasicOptions {
	message_thread_id?: number | undefined
	disable_notification?: boolean | undefined
	reply_to_message_id?: number | undefined
	reply_markup?:
		| InlineKeyboardMarkup
		| ReplyKeyboardMarkup
		| ReplyKeyboardRemove
		| ForceReply
		| undefined
	protect_content?: boolean | undefined
	allow_sending_without_reply?: boolean | undefined
}

interface SendMessageOptions extends SendBasicOptions {
	parse_mode?: ParseMode | undefined
	disable_web_page_preview?: boolean | undefined
}

interface AnswerInlineQueryOptions {
	cache_time?: number | undefined
	is_personal?: boolean | undefined
	next_offset?: string | undefined
	switch_pm_text?: string | undefined
	switch_pm_parameter?: string | undefined
}

interface ForwardMessageOptions {
	disable_notification?: boolean | undefined
	protect_content?: boolean | undefined
}

interface SendPhotoOptions extends SendBasicOptions {
	has_spoiler?: boolean | undefined
	parse_mode?: ParseMode | undefined
	caption?: string | undefined
}

interface FileOptions {
	filename?: string | undefined
	contentType?: string | undefined
}

interface BanOptions {
	until_date?: number | undefined
	revoke_messages?: boolean | undefined
}

interface UnbanOptions {
	only_if_banned?: boolean | undefined
}

interface SendAudioOptions extends SendBasicOptions {
	parse_mode?: ParseMode | undefined
	caption?: string | undefined
	duration?: number | undefined
	performer?: string | undefined
	title?: string | undefined
}

interface SendAnimationOptions extends SendBasicOptions {
	has_spoiler?: boolean | undefined
	parse_mode?: ParseMode | undefined
	caption?: string | undefined
	duration?: number | undefined
	width?: number | undefined
	height?: number | undefined
}

interface SendDocumentOptions extends SendBasicOptions {
	parse_mode?: ParseMode | undefined
	caption?: string | undefined
}

interface SendMediaGroupOptions {
	disable_notification?: boolean | undefined
	reply_to_message_id?: number | undefined
}

interface SendPollOptions extends SendBasicOptions {
	is_anonymous?: boolean | undefined
	type?: PollType | undefined
	allows_multiple_answers?: boolean | undefined
	correct_option_id?: number | undefined
	explanation?: string | undefined
	explanation_parse_mode?: ParseMode | undefined
	open_period?: number | undefined
	close_date?: number | undefined
	is_closed?: boolean | undefined
}

interface StopPollOptions {
	reply_markup?: InlineKeyboardMarkup | undefined
}

type SendStickerOptions = SendBasicOptions

interface SendVideoOptions extends SendBasicOptions {
	has_spoiler?: boolean | undefined
	parse_mode?: ParseMode | undefined
	duration?: number | undefined
	width?: number | undefined
	height?: number | undefined
	caption?: string | undefined
}

interface SendVoiceOptions extends SendBasicOptions {
	parse_mode?: ParseMode | undefined
	caption?: string | undefined
	duration?: number | undefined
}

interface SendVideoNoteOptions extends SendBasicOptions {
	duration?: number | undefined
	length?: number | undefined
}

interface SendLocationOptions extends SendBasicOptions {
	live_period?: number | undefined
	horizontal_accuracy?: number | undefined
	heading?: number | undefined
	proximity_alert_radius?: number | undefined
}

type EditMessageLiveLocationOptions = EditMessageCaptionOptions

type StopMessageLiveLocationOptions = EditMessageCaptionOptions

interface SendVenueOptions extends SendBasicOptions {
	foursquare_id?: string | undefined
}

interface SendContactOptions extends SendBasicOptions {
	last_name?: string | undefined
	vcard?: string | undefined
}

type SendGameOptions = SendBasicOptions

interface SendInvoiceOptions extends SendBasicOptions {
	provider_data?: string | undefined
	photo_url?: string | undefined
	photo_size?: number | undefined
	photo_width?: number | undefined
	photo_height?: number | undefined
	start_parameter?: string | undefined
	need_name?: boolean | undefined
	need_phone_number?: boolean | undefined
	need_email?: boolean | undefined
	need_shipping_address?: boolean | undefined
	is_flexible?: boolean | undefined
}

interface CopyMessageOptions extends SendBasicOptions {
	caption?: string | undefined
	parse_mode?: ParseMode | undefined
	caption_entities?: MessageEntity[] | undefined
}

interface RestrictChatMemberOptions {
	until_date?: number | undefined
	permissions: ChatPermissions
	use_independent_chat_permissions?: boolean | undefined
}

interface PromoteChatMemberOptions {
	is_anonymous?: boolean | undefined
	can_manage_chat?: boolean | undefined
	can_change_info?: boolean | undefined
	can_post_messages?: boolean | undefined
	can_edit_messages?: boolean | undefined
	can_delete_messages?: boolean | undefined
	can_invite_users?: boolean | undefined
	can_restrict_members?: boolean | undefined
	can_pin_messages?: boolean | undefined
	can_promote_members?: boolean | undefined
	can_manage_video_chats?: boolean | undefined
	can_manage_topics?: boolean | undefined
}

interface CreateForumTopicOptions {
	icon_color?: number | undefined
	icon_custom_emoji_id?: string | undefined
}

interface EditForumTopicOptions {
	name?: string | undefined
	icon_custom_emoji_id?: string | undefined
}

interface SendChatActionOptions {
	message_thread_id?: number | undefined
}

interface SetChatPermissionsOptions {
	use_independent_chat_permissions?: boolean | undefined
}

interface AnswerCallbackQueryOptions {
	callback_query_id: string
	text?: string | undefined
	show_alert?: boolean | undefined
	url?: string | undefined
	cache_time?: number | undefined
}

interface EditMessageTextOptions extends EditMessageCaptionOptions {
	parse_mode?: ParseMode | undefined
	disable_web_page_preview?: boolean | undefined
}

interface EditMessageCaptionOptions extends EditMessageReplyMarkupOptions {
	reply_markup?: InlineKeyboardMarkup | undefined
	parse_mode?: ParseMode | undefined
	caption_entities?: MessageEntity[] | undefined
}

interface EditMessageReplyMarkupOptions {
	chat_id?: ChatId | undefined
	message_id?: number | undefined
	inline_message_id?: string | undefined
}

interface EditMessageMediaOptions {
	chat_id?: ChatId | undefined
	message_id?: number | undefined
	inline_message_id?: string | undefined
	reply_markup?: InlineKeyboardMarkup | undefined
}

interface GetUserProfilePhotosOptions {
	offset?: number | undefined
	limit?: number | undefined
}

interface SetGameScoreOptions {
	force?: boolean | undefined
	disable_edit_message?: boolean | undefined
	chat_id?: number | undefined
	message_id?: number | undefined
	inline_message_id?: string | undefined
}

interface GetGameHighScoresOptions {
	chat_id?: number | undefined
	message_id?: number | undefined
	inline_message_id?: string | undefined
}

interface AnswerShippingQueryOptions {
	shipping_options?: ShippingOption[] | undefined
	error_message?: string | undefined
}

interface AnswerPreCheckoutQueryOptions {
	error_message?: string | undefined
}

interface SendDiceOptions extends SendBasicOptions {
	emoji?: string | undefined
}

interface PinChatMessageOptions {
	disable_notification?: boolean | undefined
}

interface UnpinChatMessageOptions {
	message_id?: number | undefined
}

/// TELEGRAM TYPES ///
interface PassportFile {
	file_id: string
	file_size: number
	file_date: number
}

interface EncryptedPassportElement {
	type: string
	data?: string | undefined
	phone_number?: string | undefined
	email?: string | undefined
	files?: PassportFile[] | undefined
	front_side?: PassportFile | undefined
	reverse_side?: PassportFile | undefined
	selfie?: PassportFile | undefined
	translation?: PassportFile[] | undefined
	hash: string
}

interface EncryptedCredentials {
	data: string
	hash: string
	secret: string
}

interface PassportData {
	data: EncryptedPassportElement[]
	credentials: EncryptedCredentials
}

interface Update {
	update_id: number
	message?: Message | undefined
	edited_message?: Message | undefined
	channel_post?: Message | undefined
	edited_channel_post?: Message | undefined
	inline_query?: InlineQuery | undefined
	chosen_inline_result?: ChosenInlineResult | undefined
	callback_query?: CallbackQuery | undefined
	shipping_query?: ShippingQuery | undefined
	pre_checkout_query?: PreCheckoutQuery | undefined
	poll?: Poll | undefined
	poll_answer?: PollAnswer | undefined
	my_chat_member?: ChatMemberUpdated | undefined
	chat_member?: ChatMemberUpdated | undefined
	chat_join_request?: ChatJoinRequest | undefined
}

interface WebhookInfo {
	url: string
	has_custom_certificate: boolean
	pending_update_count: number
	ip_address?: string | undefined
	last_error_date?: number | undefined
	last_error_message?: string | undefined
	last_synchronization_error_date?: number | undefined
	max_connections?: number | undefined
	allowed_updates?: string[] | undefined
}

interface User {
	id: number
	is_bot: boolean
	first_name: string
	last_name?: string | undefined
	username?: string | undefined
	language_code?: string | undefined
}

interface Chat {
	id: number
	type: ChatType
	title?: string | undefined
	username?: string | undefined
	first_name?: string | undefined
	last_name?: string | undefined
	is_forum?: boolean | undefined
	photo?: ChatPhoto | undefined
	active_usernames?: string[] | undefined
	emoji_status_custom_emoji_id?: string | undefined
	bio?: string | undefined
	has_restricted_voice_and_video_messages?: boolean | undefined
	join_to_send_messages?: boolean | undefined
	join_by_request?: boolean | undefined
	description?: string | undefined
	invite_link?: string | undefined
	has_aggressive_anti_spam_enabled?: boolean | undefined
	has_hidden_members?: boolean | undefined
	pinned_message?: Message | undefined
	permissions?: ChatPermissions | undefined
	can_set_sticker_set?: boolean | undefined
	sticker_set_name?: string | undefined
	has_private_forwards?: boolean | undefined
	has_protected_content?: boolean | undefined
	slow_mode_delay?: number | undefined
	message_auto_delete_time?: number | undefined
	linked_chat_id?: number | undefined
	location?: ChatLocation | undefined
	/**
	 * @deprecated since version Telegram Bot API 4.4 - July 29, 2019
	 */
	all_members_are_administrators?: boolean | undefined
}

interface Message {
	message_id: number
	message_thread_id?: number | undefined
	from?: User | undefined
	date: number
	chat: Chat
	sender_chat?: Chat | undefined
	forward_from?: User | undefined
	forward_from_chat?: Chat | undefined
	forward_from_message_id?: number | undefined
	forward_signature?: string | undefined
	forward_sender_name?: string | undefined
	forward_date?: number | undefined
	is_topic_message?: boolean | undefined
	reply_to_message?: Message | undefined
	edit_date?: number | undefined
	media_group_id?: string | undefined
	author_signature?: string | undefined
	text?: string | undefined
	entities?: MessageEntity[] | undefined
	caption_entities?: MessageEntity[] | undefined
	audio?: Audio | undefined
	document?: Document | undefined
	animation?: Animation | undefined
	game?: Game | undefined
	photo?: PhotoSize[] | undefined
	sticker?: Sticker | undefined
	video?: Video | undefined
	voice?: Voice | undefined
	video_note?: VideoNote | undefined
	caption?: string | undefined
	contact?: Contact | undefined
	location?: Location | undefined
	venue?: Venue | undefined
	poll?: Poll | undefined
	new_chat_members?: User[] | undefined
	left_chat_member?: User | undefined
	new_chat_title?: string | undefined
	new_chat_photo?: PhotoSize[] | undefined
	delete_chat_photo?: boolean | undefined
	group_chat_created?: boolean | undefined
	supergroup_chat_created?: boolean | undefined
	channel_chat_created?: boolean | undefined
	migrate_to_chat_id?: number | undefined
	migrate_from_chat_id?: number | undefined
	pinned_message?: Message | undefined
	invoice?: Invoice | undefined
	successful_payment?: SuccessfulPayment | undefined
	connected_website?: string | undefined
	passport_data?: PassportData | undefined
	reply_markup?: InlineKeyboardMarkup | undefined
	web_app_data?: WebAppData | undefined
	is_automatic_forward?: boolean | undefined
	has_protected_content?: boolean | undefined
	dice?: Dice | undefined
	forum_topic_created?: ForumTopicCreated | undefined
	forum_topic_edited?: ForumTopicEdited | undefined
	forum_topic_closed?: ForumTopicClosed | undefined
	forum_topic_reopened?: ForumTopicReopened | undefined
	general_forum_topic_hidden?: GeneralForumTopicHidden | undefined
	general_forum_topic_unhidden?: GeneralForumTopicUnhidden | undefined
	has_media_spoiler?: boolean | undefined
	user_shared?: UserShared | undefined
	chat_shared?: ChatShared | undefined
}

interface MessageEntity {
	type: MessageEntityType
	offset: number
	length: number
	url?: string | undefined
	user?: User | undefined
	language?: string | undefined
	custom_emoji_id?: string | undefined
}

interface FileBase {
	file_id: string
	file_unique_id: string
	file_size?: number | undefined
}

interface PhotoSize extends FileBase {
	width: number
	height: number
}

interface Audio extends FileBase {
	duration: number
	performer?: string | undefined
	title?: string | undefined
	mime_type?: string | undefined
	thumb?: PhotoSize | undefined
}

interface Document extends FileBase {
	thumb?: PhotoSize | undefined
	file_name?: string | undefined
	mime_type?: string | undefined
}

interface Video extends FileBase {
	width: number
	height: number
	duration: number
	thumb?: PhotoSize | undefined
	mime_type?: string | undefined
}

interface Voice extends FileBase {
	duration: number
	mime_type?: string | undefined
}

interface InputMediaBase {
	media: string
	has_spoiler?: boolean | undefined
	caption?: string | undefined
	parse_mode?: ParseMode | undefined
}

interface InputMediaPhoto extends InputMediaBase {
	type: "photo"
}

interface InputMediaVideo extends InputMediaBase {
	type: "video"
	width?: number | undefined
	height?: number | undefined
	duration?: number | undefined
	supports_streaming?: boolean | undefined
}

type InputMedia = InputMediaPhoto | InputMediaVideo

interface VideoNote extends FileBase {
	length: number
	duration: number
	thumb?: PhotoSize | undefined
}

interface Contact {
	phone_number: string
	first_name: string
	last_name?: string | undefined
	user_id?: number | undefined
	vcard?: string | undefined
}

interface ChatLocation {
	location: Location
	address: string
}

interface Location {
	longitude: number
	latitude: number
}

interface Venue {
	location: Location
	title: string
	address: string
	foursquare_id?: string | undefined
	foursquare_type?: string | undefined
}

type PollType = "regular" | "quiz"

interface PollAnswer {
	poll_id: string
	user: User
	option_ids: number[]
}

interface PollOption {
	text: string
	voter_count: number
}

interface Poll {
	id: string
	question: string
	options: PollOption[]
	is_closed: boolean
	is_anonymous: boolean
	allows_multiple_answers: boolean
	type: PollType
	total_voter_count: number
}

interface Dice {
	emoji: string
	value: number
}

interface ChatJoinRequest {
	chat: Chat
	from: User
	user_chat_id: number
	date: number
	bio?: string | undefined
	invite_link?: ChatInviteLink | undefined
}

interface UserProfilePhotos {
	total_count: number
	photos: PhotoSize[][]
}

interface File extends FileBase {
	file_path?: string | undefined
}

interface ReplyKeyboardMarkup {
	keyboard: KeyboardButton[][]
	is_persistent?: boolean | undefined
	resize_keyboard?: boolean | undefined
	one_time_keyboard?: boolean | undefined
	input_field_placeholder?: string | undefined
	selective?: boolean | undefined
}

interface KeyboardButton {
	text: string
	request_user?: KeyboardButtonRequestUser | undefined
	request_chat?: KeyboardButtonRequestChat | undefined
	request_contact?: boolean | undefined
	request_location?: boolean | undefined
	request_poll?: KeyboardButtonPollType
	web_app?: WebAppInfo
}

interface KeyboardButtonPollType {
	type: PollType
}

interface KeyboardButtonRequestUser {
	request_id: number
	user_is_bot?: boolean | undefined
	user_is_premium?: boolean | undefined
}

interface KeyboardButtonRequestChat {
	request_id: number
	chat_is_channel: boolean
	chat_is_forum?: boolean | undefined
	chat_has_username?: boolean | undefined
	chat_is_created?: boolean | undefined
	user_administrator_rights?: boolean | undefined
	bot_administrator_rights?: boolean | undefined
	bot_is_member?: boolean | undefined
}

interface ReplyKeyboardRemove {
	remove_keyboard: boolean
	selective?: boolean | undefined
}

interface InlineKeyboardMarkup {
	inline_keyboard: InlineKeyboardButton[][]
}

interface InlineKeyboardButton {
	text: string
	url?: string | undefined
	callback_data?: string | undefined
	web_app?: WebAppInfo
	login_url?: LoginUrl | undefined
	switch_inline_query?: string | undefined
	switch_inline_query_current_chat?: string | undefined
	callback_game?: CallbackGame | undefined
	pay?: boolean | undefined
}

interface LoginUrl {
	url: string
	forward_text?: string | undefined
	bot_username?: string | undefined
	request_write_access?: boolean | undefined
}

interface CallbackQuery {
	id: string
	from: User
	message?: Message | undefined
	inline_message_id?: string | undefined
	chat_instance: string
	data?: string | undefined
	game_short_name?: string | undefined
}

interface ForceReply {
	force_reply: boolean
	input_field_placeholder?: string | undefined
	selective?: boolean | undefined
}

interface ChatPhoto {
	small_file_id: string
	big_file_id: string
}

interface ChatInviteLink {
	invite_link: string
	creator: User
	is_primary: boolean
	is_revoked: boolean
	expire_date?: number
	member_limit?: number
	name?: string
}

interface ChatMember {
	user: User
	status: ChatMemberStatus
	until_date?: number | undefined
	can_be_edited?: boolean | undefined
	can_post_messages?: boolean | undefined
	can_edit_messages?: boolean | undefined
	can_delete_messages?: boolean | undefined
	can_restrict_members?: boolean | undefined
	can_promote_members?: boolean | undefined
	can_change_info?: boolean | undefined
	can_invite_users?: boolean | undefined
	can_pin_messages?: boolean | undefined
	is_member?: boolean | undefined
	can_send_messages?: boolean | undefined
	can_send_media_messages?: boolean | undefined
	can_send_polls?: boolean | undefined
	can_send_other_messages?: boolean | undefined
	can_add_web_page_previews?: boolean | undefined
}

interface ChatMemberUpdated {
	chat: Chat
	from: User
	date: number
	old_chat_member: ChatMember
	new_chat_member: ChatMember
	invite_link?: ChatInviteLink
}

interface ChatPermissions {
	can_send_messages?: boolean | undefined
	can_send_audios?: boolean | undefined
	can_send_documents?: boolean | undefined
	can_send_photos?: boolean | undefined
	can_send_videos?: boolean | undefined
	can_send_video_notes?: boolean | undefined
	can_send_voice_notes?: boolean | undefined
	can_send_polls?: boolean | undefined
	can_send_other_messages?: boolean | undefined
	can_add_web_page_previews?: boolean | undefined
	can_change_info?: boolean | undefined
	can_invite_users?: boolean | undefined
	can_pin_messages?: boolean | undefined
	can_manage_topics?: boolean | undefined
}

type StickerType = "regular" | "mask" | "custom_emoji"

interface Sticker extends FileBase {
	type: StickerType
	is_animated: boolean
	is_video: boolean
	width: number
	height: number
	thumb?: PhotoSize | undefined
	emoji?: string | undefined
	set_name?: string | undefined
	premium_animation?: File | undefined
	mask_position?: MaskPosition | undefined
	custom_emoji_id?: string | undefined
}

interface StickerSet {
	name: string
	title: string
	sticker_type: StickerType
	is_animated: boolean
	is_video: boolean
	stickers: Sticker[]
	thumb?: PhotoSize | undefined
}

interface CreateStickerSetOptions {
	tgs_sticker?: string | Stream | Buffer
	webm_sticker?: string | Stream | Buffer
	sticker_type?: "regular" | "mask"
	mask_position?: MaskPosition
}

interface AddStickerToSetOptions {
	mask_position?: MaskPosition
}

interface ForumTopicCreated {
	name: string
	icon_color: number
	icon_custom_emoji_id: string
}

// tslint:disable-next-line:no-empty-interface Currently holds no information (https://core.telegram.org/bots/api#forumtopicclosed)
interface ForumTopicClosed {}

interface ForumTopicEdited {
	name: string
	icon_custom_emoji_id: string
}

// tslint:disable-next-line:no-empty-interface Currently holds no information (https://core.telegram.org/bots/api#forumtopicreopened)
interface ForumTopicReopened {}

// tslint:disable-next-line:no-empty-interface Currently holds no information (https://core.telegram.org/bots/api#generalforumtopichidden)
interface GeneralForumTopicHidden {}

// tslint:disable-next-line:no-empty-interface Currently holds no information (https://core.telegram.org/bots/api#generalforumtopicunhidden)
interface GeneralForumTopicUnhidden {}

interface UserShared {
	request_id: number
	user_id: number
}

interface ChatShared {
	request_id: number
	chat_id: number
}

interface MaskPosition {
	point: string
	x_shift: number
	y_shift: number
	scale: number
}

interface InlineQuery {
	id: string
	from: User
	location?: Location | undefined
	query: string
	offset: string
}

interface InlineQueryResultBase {
	id: string
	reply_markup?: InlineKeyboardMarkup | undefined
}

interface InlineQueryResultArticle extends InlineQueryResultBase {
	type: "article"
	title: string
	input_message_content: InputMessageContent
	url?: string | undefined
	hide_url?: boolean | undefined
	description?: string | undefined
	thumb_url?: string | undefined
	thumb_width?: number | undefined
	thumb_height?: number | undefined
}

interface InlineQueryResultPhoto extends InlineQueryResultBase {
	type: "photo"
	photo_url: string
	thumb_url: string
	photo_width?: number | undefined
	photo_height?: number | undefined
	title?: string | undefined
	description?: string | undefined
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultGif extends InlineQueryResultBase {
	type: "gif"
	gif_url: string
	gif_width?: number | undefined
	gif_height?: number | undefined
	gif_duration?: number | undefined
	thumb_url?: string | undefined
	title?: string | undefined
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultMpeg4Gif extends InlineQueryResultBase {
	type: "mpeg4_gif"
	mpeg4_url: string
	mpeg4_width?: number | undefined
	mpeg4_height?: number | undefined
	mpeg4_duration?: number | undefined
	thumb_url?: string | undefined
	title?: string | undefined
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultVideo extends InlineQueryResultBase {
	type: "video"
	video_url: string
	mime_type: string
	thumb_url: string
	title: string
	caption?: string | undefined
	video_width?: number | undefined
	video_height?: number | undefined
	video_duration?: number | undefined
	description?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultAudio extends InlineQueryResultBase {
	type: "audio"
	audio_url: string
	title: string
	caption?: string | undefined
	performer?: string | undefined
	audio_duration?: number | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultVoice extends InlineQueryResultBase {
	type: "voice"
	voice_url: string
	title: string
	caption?: string | undefined
	voice_duration?: number | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultDocument extends InlineQueryResultBase {
	type: "document"
	title: string
	caption?: string | undefined
	document_url: string
	mime_type: string
	description?: string | undefined
	input_message_content?: InputMessageContent | undefined
	thumb_url?: string | undefined
	thumb_width?: number | undefined
	thumb_height?: number | undefined
}

interface InlineQueryResultLocationBase extends InlineQueryResultBase {
	latitude: number
	longitude: number
	title: string
	input_message_content?: InputMessageContent | undefined
	thumb_url?: string | undefined
	thumb_width?: number | undefined
	thumb_height?: number | undefined
}

interface InlineQueryResultLocation extends InlineQueryResultLocationBase {
	type: "location"
}

interface InlineQueryResultVenue extends InlineQueryResultLocationBase {
	type: "venue"
	address: string
	foursquare_id?: string | undefined
}

interface InlineQueryResultContact extends InlineQueryResultBase {
	type: "contact"
	phone_number: string
	first_name: string
	last_name?: string | undefined
	input_message_content?: InputMessageContent | undefined
	thumb_url?: string | undefined
	thumb_width?: number | undefined
	thumb_height?: number | undefined
}

interface InlineQueryResultGame extends InlineQueryResultBase {
	type: "game"
	game_short_name: string
}

interface InlineQueryResultCachedPhoto extends InlineQueryResultBase {
	type: "photo"
	photo_file_id: string
	title?: string | undefined
	description?: string | undefined
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultCachedGif extends InlineQueryResultBase {
	type: "gif"
	gif_file_id: string
	title?: string | undefined
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultCachedMpeg4Gif extends InlineQueryResultBase {
	type: "mpeg4_gif"
	mpeg4_file_id: string
	title?: string | undefined
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultCachedSticker extends InlineQueryResultBase {
	type: "sticker"
	sticker_file_id: string
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultCachedDocument extends InlineQueryResultBase {
	type: "document"
	title: string
	document_file_id: string
	description?: string | undefined
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultCachedVideo extends InlineQueryResultBase {
	type: "video"
	video_file_id: string
	title: string
	description?: string | undefined
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultCachedVoice extends InlineQueryResultBase {
	type: "voice"
	voice_file_id: string
	title: string
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

interface InlineQueryResultCachedAudio extends InlineQueryResultBase {
	type: "audio"
	audio_file_id: string
	caption?: string | undefined
	input_message_content?: InputMessageContent | undefined
}

type InlineQueryResult =
	| InlineQueryResultCachedAudio
	| InlineQueryResultCachedDocument
	| InlineQueryResultCachedGif
	| InlineQueryResultCachedMpeg4Gif
	| InlineQueryResultCachedPhoto
	| InlineQueryResultCachedSticker
	| InlineQueryResultCachedVideo
	| InlineQueryResultCachedVoice
	| InlineQueryResultArticle
	| InlineQueryResultAudio
	| InlineQueryResultContact
	| InlineQueryResultGame
	| InlineQueryResultDocument
	| InlineQueryResultGif
	| InlineQueryResultLocation
	| InlineQueryResultMpeg4Gif
	| InlineQueryResultPhoto
	| InlineQueryResultVenue
	| InlineQueryResultVideo
	| InlineQueryResultVoice

type InputMessageContent = object

interface InputTextMessageContent extends InputMessageContent {
	message_text: string
	parse_mode?: ParseMode | undefined
	disable_web_page_preview?: boolean | undefined
}

interface InputLocationMessageContent extends InputMessageContent {
	latitude: number
	longitude: number
}

interface InputVenueMessageContent extends InputLocationMessageContent {
	title: string
	address: string
	foursquare_id?: string | undefined
}

interface InputContactMessageContent extends InputMessageContent {
	phone_number: string
	first_name: string
	last_name?: string | undefined
}

interface ChosenInlineResult {
	result_id: string
	from: User
	location?: Location | undefined
	inline_message_id?: string | undefined
	query: string
}

interface ResponseParameters {
	migrate_to_chat_id?: number | undefined
	retry_after?: number | undefined
}

interface LabeledPrice {
	label: string
	amount: number
}

interface Invoice {
	title: string
	description: string
	start_parameter: string
	currency: string
	total_amount: number
}

interface ShippingAddress {
	country_code: string
	state: string
	city: string
	street_line1: string
	street_line2: string
	post_code: string
}

interface OrderInfo {
	name?: string | undefined
	phone_number?: string | undefined
	email?: string | undefined
	shipping_address?: ShippingAddress | undefined
}

interface ShippingOption {
	id: string
	title: string
	prices: LabeledPrice[]
}

interface SuccessfulPayment {
	currency: string
	total_amount: number
	invoice_payload: string
	shipping_option_id?: string | undefined
	order_info?: OrderInfo | undefined
	telegram_payment_charge_id: string
	provider_payment_charge_id: string
}

interface ShippingQuery {
	id: string
	from: User
	invoice_payload: string
	shipping_address: ShippingAddress
}

interface PreCheckoutQuery {
	id: string
	from: User
	currency: string
	total_amount: number
	invoice_payload: string
	shipping_option_id?: string | undefined
	order_info?: OrderInfo | undefined
}

interface Game {
	title: string
	description: string
	photo: PhotoSize[]
	text?: string | undefined
	text_entities?: MessageEntity[] | undefined
	animation?: Animation | undefined
}

interface Animation extends FileBase {
	width: number
	height: number
	duration: number
	thumb?: PhotoSize | undefined
	file_name?: string | undefined
	mime_type?: string | undefined
}

type CallbackGame = object

interface GameHighScore {
	position: number
	user: User
	score: number
}

interface Metadata {
	type?: MessageType | undefined
}

interface BotCommand {
	command: string
	description: string
}

interface MessageId {
	message_id: number
}

type ChatId = number | string

interface BotCommandScopeDefault {
	type: "default"
}

interface BotCommandScopeAllPrivateChats {
	type: "all_private_chats"
}

interface BotCommandScopeAllGroupChats {
	type: "all_group_chats"
}

interface BotCommandScopeAllChatAdministrators {
	type: "all_chat_administrators"
}

interface BotCommandScopeChat {
	type: "chat"
	chat_id: ChatId
}

interface BotCommandScopeChatAdministrators {
	type: "chat_administrators"
	chat_id: ChatId
}

interface BotCommandScopeChatMember {
	type: "chat_member"
	chat_id: ChatId
	user_id: number
}

type BotCommandScope =
	| BotCommandScopeDefault
	| BotCommandScopeAllPrivateChats
	| BotCommandScopeAllGroupChats
	| BotCommandScopeAllChatAdministrators
	| BotCommandScopeChat
	| BotCommandScopeChatAdministrators
	| BotCommandScopeChatMember
interface WebAppInfo {
	url: string
}

interface WebAppData {
	data: string
	button_text: string
}

interface MenuButtonCommands {
	type: "commands"
}
interface MenuButtonWebApp {
	type: "web_app"
	text: string
	web_app: WebAppInfo
}
interface MenuButtonDefault {
	type: "default"
}

type MenuButton = MenuButtonCommands | MenuButtonWebApp | MenuButtonDefault

interface ChatAdministratorRights {
	is_anonymous: boolean
	can_manage_chat: boolean
	can_delete_messages: boolean
	can_manage_video_chats: boolean
	can_restrict_members: boolean
	can_promote_members: boolean
	can_change_info: boolean
	can_invite_users: boolean
	can_post_messages?: boolean
	can_edit_messages?: boolean
	can_pin_messages?: boolean
	can_manage_topics?: boolean
}

interface SentWebAppMessage {
	inline_message_id?: string
}
