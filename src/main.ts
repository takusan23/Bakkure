import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject"

declare const window: RPGAtsumaruWindow

// プレイヤー
let player: g.Sprite
// スコア表示ラベル
let scoreLabel: g.Label

export function main(param: GameMainParameterObject): void {
	const scene = new g.Scene({
		game: g.game,
		// このシーンで利用するアセットのIDを列挙し、シーンに通知します
		assetIds: ["toomo", "irasutoya_kousya", "tuusinbo", "se"]
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
			text: "SCORE: 0",
			font: font,
			fontSize: font.size / 2,
			textColor: "black"
		})
		scene.append(scoreLabel)

		// 残り時間表示用ラベル
		const timeLabel = new g.Label({
			scene: scene,
			text: "TIME: 0",
			font: font,
			fontSize: font.size / 2,
			textColor: "black",
			x: 0.7 * g.game.width
		})
		scene.append(timeLabel)

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


		// スクーリング（減点）追加
		scene.setInterval(() => {
			if (time > 0) {
				// スクーリング生成
				const kousya = createSchooling()
				scene.append(kousya)
				// 流す
				setItem(kousya, -10)

				// 通知表生成
				const tsuusinbo = createTsusinbo()
				scene.append(tsuusinbo)
				setItem(tsuusinbo, 20)

				// 令和2020年 元ネタ：https://www.youtube.com/watch?v=7Qry4qTFiIM 令和2020年はバックレません
				const reiwa = createReiwa2020()
				scene.append(reiwa)
				setItem(reiwa, 2020, 200)
			}
		}, 1000)


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
					window.RPGAtsumaru.experimental.scoreboards.setRecord(boardId, g.game.vars.gameState.score).then(function () {
						window.RPGAtsumaru.experimental.scoreboards.display(boardId)
					})
				}
				scene.update.remove(updateHandler) // カウントダウンを止めるためにこのイベントハンドラを削除します
			}
			// カウントダウン処理
			time -= 1 / g.game.fps
			timeLabel.text = "TIME: " + Math.ceil(time)
			timeLabel.invalidate()
		}
		scene.update.add(updateHandler)
		// ここまでゲーム内容を記述します

	})
	g.game.pushScene(scene)

	// スクーリング（学校）生成
	const createSchooling = (): g.Sprite => {
		// 生成
		const kousya = new g.Sprite({
			scene: scene,
			src: scene.assets["irasutoya_kousya"],
			x: g.game.width
		})
		kousya.y = g.game.random.get(kousya.height, g.game.height) // 高さランダム
		return kousya
	}

	// 通信簿　生成
	const createTsusinbo = (): g.Sprite => {
		// 生成
		const tsuusinbo = new g.Sprite({
			scene: scene,
			src: scene.assets["tuusinbo"],
			x: g.game.width
		})
		tsuusinbo.y = g.game.random.get(tsuusinbo.height, g.game.height) // 高さランダム
		return tsuusinbo
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

	// 障害物を流す、範囲外に行ったら消す、プレイヤーと当たったときの処理。
	const setItem = (item: g.E, point: number, speed: number = 10) => {
		item.update.add(() => {
			item.x -= speed
			if (item.x < -100) {
				// 範囲外に行ったら消す
				item.destroy()
			}
			// プレイヤーと当たったら
			if (g.Collision.intersectAreas(item, player)) {
				// 加算
				g.game.vars.gameState.score += point
				scoreLabel.text = "SCORE: " + g.game.vars.gameState.score
				scoreLabel.invalidate()
				// 障害物を消す
				item.destroy()
			}
			// 更新
			item.modified()
		})
	}

}
