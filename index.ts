import {
	Color,
	EventsSDK,
	GUIInfo,
	LocalPlayer,
	Menu,
	naga_siren_mirror_image,
	npc_dota_hero_naga_siren,
	Rectangle,
	RendererSDK,
	TextFlags,
	Vector2
} from "github.com/octarine-public/wrapper/index"

new (class ArmletAbuseScript {
	// Создаем меню в чите по аналогии с примером
	private readonly entry = Menu.AddEntry("Armlet Abuse")

	// Настройки скрипта
	private readonly hotkey = this.entry.AddKeybind("Hotkey for Abuse", "X", "Press and hold to abuse Armlet")
	private readonly toggleDelay = this.entry.AddSlider("Toggle Delay (ms)", 35, 1, 150)
	private readonly checkStatus = this.entry.AddToggle("Check Stuns/Silence", true)

	private lastToggleTime: number = 0
	private isToggling: boolean = false

	constructor() {
		// Подписываемся на события в точности как в примере
		EventsSDK.on("Draw", this.OnUpdate.bind(this))
		EventsSDK.on("GameEnded", this.GameEnded.bind(this))
	}

	private OnUpdate(): void {
		const hero = LocalPlayer?.Hero
		
		// Базовая проверка: если героя нет или он мертв — ничего не делаем
		if (hero === undefined || !hero.IsAlive) {
			return
		}

		// Проверяем станы и сайленс (если включена галочка в меню)
		if (this.checkStatus.value && (hero.IsStunned || hero.IsSilenced)) {
			this.isToggling = false
			return
		}

		// Ищем Армлет в списке предметов (Items) героя
		const armlet = hero.Items.find((item: any) => item.Name === "item_armlet")
		if (armlet === undefined || !armlet.CanBeCasted()) {
			return
		}

		// Если кнопка абуза зажата
		if (this.hotkey.isPressed) {
			const currentTime = Date.now()

			if (!this.isToggling) {
				// Если армлет включен (активен), выключаем его первым действием
				if (armlet.IsToggled) {
					hero.CastNoTarget(armlet, false, true)
					this.lastToggleTime = currentTime
					this.isToggling = true
				} else {
					// Если он уже был выключен — сразу включаем
					hero.CastNoTarget(armlet, false, true)
				}
			} else {
				// Ждем задержку (в мс), которую ты выставил на слайдере в меню
				if (currentTime - this.lastToggleTime >= this.toggleDelay.value) {
					if (!armlet.IsToggled) {
						hero.CastNoTarget(armlet, false, true)
					}
					this.isToggling = false // Сбрасываем флаг для следующего цикла
				}
			}
		} else {
			this.isToggling = false
		}
	}

	private GameEnded(): void {
		this.hotkey.isPressed = false
		this.isToggling = false
	}
})()
