/**
 * Created by rfrance on 11/29/2016.
 */
importScripts(
	'./utils_1.js',
	'./utils_2.js',
	'game_1.js',
	'game_2.js');
/**
 * 
 * @param {CanvasRenderingContext2D} ctx
 * @param {utils.geometry2d.Rect} rect
 * @param {game.Object[]} objects
 * @param {function(number, game.Object)} filter
 * @param {game.RenderLayer|number} layerMin
 * @param {game.RenderLayer|number} layerMax
 * @param {game.renderEventCallback} callback,
 * @param {enum} renderEvents
 */
function render(ctx, rect, objects, filter, layerMin, layerMax, callback, renderEvents) {
	ctx.clearRect(rect.left, rect.top, rect.right, rect.bottom);
	if(callback) {
		ctx.save();
		callback(renderEvents.RENDER_BEGIN, ctx);
	}
	l = layerMin-1;
	while(l++ < layerMax) {
		ctx.save();
		if(callback) callback(renderEvents.RENDER_LAYER_BEGIN, ctx);
		objects = objects.filter(filter.bind(undefined, l));
		i = objects.length;
		while(i--) if(!objects[i].isOutOfRect(rect)) objs[i].render(ctx);
		if(callback) callback(rEvent.RENDER_LAYER_END, ctx);
		ctx.restore();
	}
	if(callback) {
		callback(RenderEvent.RENDER_END, ctx);
		ctx.restore();
	}
}
function onmessage(e) {
	render(e.ctx, e.rect, e.objects, e.filter, e.layerMin, e.layerMax, e.callback, e.renderEvents);
}
