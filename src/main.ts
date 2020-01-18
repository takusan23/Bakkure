import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject"

declare const window: RPGAtsumaruWindow

// プレイヤー
let player: g.Sprite
// スコア表示ラベル
let scoreLabel: g.Label

// カラオケモード
let isKaraokeMode = false
let karaokeLabel: g.Label
let karaokeCount = 10
let karaokeInterval: g.TimerIdentifier

export function main(param: GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["toomo", "irasutoya_kousya", "bakkure_1", "karaoke", "karaoke_2", "tuusinbo", "old_toomo", "doutei_toomo", "inu", "se"]
	})
	let time = 60 // 制限時間
	if (param.sessionParameter.totalTimeLimit) {
		time = param.sessionParameter.totalTimeLimit // セッションパラメータで制限時間が指定されたらその値を使用します
	}
	// 市場コンテンツのランキングモードでは、g.game.vars.gameState.score の値をスコアとして扱います
	g.game.vars.gameState = { score: 0 }
	scene.loaded.add(() => {
		// ここからゲーム内容を記述します

		// プレイヤーを生成します
		player = new g.Sprite({
			scene: scene,
			src: scene.assets["toomo"],
			width: (scene.assets["toomo"] as g.ImageAsset).width,
			height: (scene.assets["toomo"] as g.ImageAsset).height
		})

		// プレイヤーの初期座標を、画面の中心に設定します
		player.x = 100
		player.y = (g.game.height - player.height) / 2

		// プレイヤー追加
		scene.append(player)

		// 移動できるように
		scene.pointMoveCapture.add((event) => {
			const pos = player.y
			player.y += event.prevDelta.y
			// 範囲外に行かないように
			if (player.y >= (g.game.height - 100) || player.y <= 10) {
				player.y = pos
			}
			player.modified()
		})

		// player.update.add(() => {
		// 	// 毎フレームでY座標を再計算し、プレイヤーの飛んでいる動きを表現します
		// 	// ここではMath.sinを利用して、時間経過によって増加するg.game.ageと組み合わせて
		// 	player.y = (g.game.height - player.height) / 2 + Math.sin(g.game.age % (g.game.fps * 10) / 4) * 10;

		// 	// プレイヤーの座標に変更があった場合、 modified() を実行して変更をゲームに通知します
		// 	player.modified();
		// });

		// フォントの生成
		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.SansSerif, // 明朝きらいなので
			size: 48
		})

		// スコア表示用のラベル
		scoreLabel = new g.Label({
			scene: scene,
			text: "スコア : 0",
			font: font,
			fontSize: font.size / 2,
			textColor: "black"
		})
		scene.append(scoreLabel)

		// 残り時間表示用ラベル
		const timeLabel = new g.Label({
			scene: scene,
			text: "時間 : 0",
			font: font,
			fontSize: font.size / 2,
			textColor: "black",
			x: 0.7 * g.game.width
		})
		scene.append(timeLabel)

		// カラオケモード
		karaokeLabel = new g.Label({
			scene: scene,
			text: "",
			font: font,
			fontSize: font.size / 2,
			textColor: "black",
			x: 0.7 * g.game.width,
			y: 0.05 * g.game.height
		})
		scene.append(karaokeLabel)

		// スクーリング（減点）追加
		scene.setInterval(() => {
			if (time > 0) {
				// スクーリング生成
				const kousya = createItem("irasutoya_kousya")
				scene.append(kousya)
				// 流す
				setItem({ item: kousya, point: -100 })
			}
		}, 400)

		scene.setInterval(() => {
			// 通知表生成
			if (time > 0) {
				const tsuusinbo = createItem("tuusinbo")
				scene.append(tsuusinbo)
				setItem({ item: tsuusinbo, point: 50 })
			}
		}, g.game.random.get(500, 1000))

		// scene.setInterval(() => {
		// 	// カラオケ作成
		// 	if (time > 0) {
		// 		const karaoke = createItem("karaoke")
		// 		scene.append(karaoke)
		// 		setItem({ item: karaoke, point: 100, speed: 20 })
		// 	}
		// }, g.game.random.get(500, 1000))

		scene.setInterval(() => {
			// カラオケ作成
			if (time > 0) {
				const karaoke = createItem("karaoke_2")
				scene.append(karaoke)
				initKaraoke({ item: karaoke })
			}
		}, g.game.random.get(2000, 3000))

		scene.setInterval(() => {
			// スクーリング行ってない
			if (time > 0) {
				const schoolingBakkure = createItem("bakkure_1")
				scene.append(schoolingBakkure)
				setItem({ item: schoolingBakkure, point: 200 })
			}
		}, g.game.random.get(500, 1000))

		scene.setInterval(() => {
			if (time <= 20) {
				// 残り20秒で令和2020年を表示する
				// 令和2020年 元ネタ：https://www.youtube.com/watch?v=7Qry4qTFiIM 令和2020年はバックレません
				const reiwa = createReiwa2020()
				scene.append(reiwa)
				setItem({ item: reiwa, point: 2020, speed: 100 })
			}
		}, g.game.random.get(1000, 3000))

		scene.setInterval(() => {
			// 前のトーモ作成
			if (time > 0) {
				const oldToomo = createItem("old_toomo")
				scene.append(oldToomo)
				setItem({ item: oldToomo, point: 50 })
			}
		}, g.game.random.get(1000, 3000))

		scene.setInterval(() => {
			// 童貞とーも
			if (time > 0) {
				const doutei = createItem("doutei_toomo")
				scene.append(doutei)
				setItem({ item: doutei, point: 100 })
			}
		}, g.game.random.get(1000, 3000))

		scene.setInterval(() => {
			// レモン
			if (time > 0) {
				const remon = createItem("inu")
				scene.append(remon)
				setItem({ item: remon, point: 200 })
			}
		}, g.game.random.get(1000, 3000))

		// // 画面をタッチしたとき、SEを鳴らします
		// scene.pointDownCapture.add(() => {
		// 	// 制限時間以内であればタッチ1回ごとにSCOREに+1します
		// 	if (time > 0) {
		// 		g.game.vars.gameState.score++
		// 		scoreLabel.text = "SCORE: " + g.game.vars.gameState.score
		// 		scoreLabel.invalidate()
		// 	}
		// 	(scene.assets["se"] as g.AudioAsset).play()

		// 	// プレイヤーが発射する弾を生成します
		// 	const shot = new g.Sprite({
		// 		scene: scene,
		// 		src: scene.assets["shot"],
		// 		width: (scene.assets["shot"] as g.ImageAsset).width,
		// 		height: (scene.assets["shot"] as g.ImageAsset).height
		// 	});

		// 	// 弾の初期座標を、プレイヤーの少し右に設定します
		// 	shot.x = player.x + player.width
		// 	shot.y = player.y
		// 	shot.update.add(() => {
		// 		// 毎フレームで座標を確認し、画面外に出ていたら弾をシーンから取り除きます
		// 		if (shot.x > g.game.width) shot.destroy()

		// 		// 弾を右に動かし、弾の動きを表現します
		// 		shot.x += 10

		// 		// 変更をゲームに通知します
		// 		shot.modified()
		// 	})
		// 	scene.append(shot)
		// })

		const updateHandler = () => {
			if (time <= 0) {
				// RPGアツマール環境であればランキングを表示します
				if (param.isAtsumaru) {
					const boardId = 1
					window.RPGAtsumaru.experimental.scoreboards.setRecord(boardId, g.game.vars.gameState.score).then(() => {
						window.RPGAtsumaru.experimental.scoreboards.display(boardId)
					})
				}
				scene.update.remove(updateHandler) // カウントダウンを止めるためにこのイベントハンドラを削除します
			}
			// カウントダウン処理
			time -= 1 / g.game.fps
			timeLabel.text = "時間 : " + Math.ceil(time)
			timeLabel.invalidate()
		}
		scene.update.add(updateHandler)
		// ここまでゲーム内容を記述します

	})
	g.game.pushScene(scene)

	/**
	 * 障害物生成関数。
	 * 重要 : assetIdsに追加する必要があります。
	 * @param path assetIdsで追加した名前
	 */
	const createItem = (path: string): g.Sprite => {
		// 生成
		const item = new g.Sprite({
			scene: scene,
			src: scene.assets[path],
			x: g.game.width
		})
		item.y = g.game.random.get(1, g.game.height) // 高さランダム
		return item
	}

	// 令和2020年生成。
	const createReiwa2020 = (): g.Label => {
		// フォントの生成
		const font = new g.DynamicFont({
			game: g.game,
			fontFamily: g.FontFamily.SansSerif, // 明朝きらいなので
			size: 48
		})
		const reiwa = new g.Label({
			font: font,
			scene: scene,
			text: "令和2020年",
			x: g.game.width,
			fontSize: 20
		})
		reiwa.y = g.game.random.get(reiwa.height, g.game.height)
		return reiwa
	}

	/**
	 * オブジェクトを動かす、当たったらポイント加算　など共通するものをまとめた関数。
	 * @param item オブジェクト。画像など。
	 * @param speed 移動速度。デフォ10。
	 * @param point 当たったときの加算。マイナスでもいいよ。
	 */
	const setItem = (obj: {
		item: g.E,
		speed?: number,
		point: number
	}) => {
		obj.item.update.add(() => {
			// 指定されてなければ10。
			obj.item.x -= obj?.speed ?? 10
			if (obj.item.x < -100) {
				// 範囲外に行ったら消す
				obj.item.destroy()
			}
			// プレイヤーと当たったら
			if (g.Collision.intersectAreas(obj.item, player)) {
				// 加算
				g.game.vars.gameState.score += obj.point
				scoreLabel.text = "スコア : " + g.game.vars.gameState.score
				scoreLabel.invalidate()
				// 障害物を消す
				obj.item.destroy()
			}
			// 更新
			obj.item.modified()
		})
	}

	const initKaraoke = (obj: { item: g.E }) => {
		const update = () => {
			obj.item.x -= 20
			if (obj.item.x < -100) {
				// 範囲外に行ったら消す
				obj.item.destroy()
			}
			// プレイヤーと当たったら
			if (g.Collision.intersectAreas(obj.item, player)) {
				// 初回時のみ実行しない
				if (karaokeInterval !== undefined) { scene.clearInterval(karaokeInterval) }
				// カラオケモード
				isKaraokeMode = true
				// カウンター初期化
				karaokeCount = 10
				// テキストも初期化
				karaokeLabel.text = `10`
				karaokeLabel.invalidate()

				// カウントダウン
				karaokeInterval = scene.setInterval(() => {
					if (karaokeCount === 0) { scene.clearInterval(karaokeInterval) }
					karaokeCount--
					karaokeLabel.text = `${karaokeCount}`
					if (karaokeCount === 0) {
						// 0になったら白紙へ
						karaokeLabel.text = ""
						isKaraokeMode = false
					}
					karaokeLabel.invalidate()
				}, 1000)

				// 障害物を消す
				obj.item.destroy()
				// update.add 消す。
				obj.item.update.remove(update)
			}
			// 更新
			obj.item.modified()
		}
		obj.item.update.add(update)
	}

}
